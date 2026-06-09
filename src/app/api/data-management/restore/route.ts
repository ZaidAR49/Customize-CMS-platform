import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import supabase from '@/lib/supabase'
import { NextResponse } from 'next/server'

/** Tables present in a backup file. */
const VALID_TABLES = [
  'users',
  'categories',
  'category_translations',
  'posts',
  'post_translations',
  'post_comments',
  'organization',
  'organization_translations',
  'organization_stats',
  'organization_stats_translations',
] as const

type TableName = (typeof VALID_TABLES)[number]

/**
 * Deletion order respects FK constraints (children before parents).
 * `users` is intentionally excluded — public.users rows are tied to
 * auth.users and cannot be safely bulk-deleted here.
 */
const WIPE_DELETE_ORDER: TableName[] = [
  'organization_stats_translations', // FK → organization_stats
  'organization_stats',              // FK → organization, users
  'organization_translations',        // FK → organization
  'post_comments',                   // FK → posts, users
  'post_translations',               // FK → posts
  'posts',                           // FK → users, categories
  'category_translations',           // FK → categories
  'categories',                      // no FK deps
  'organization',                    // no FK deps (once stats/translations are deleted)
]

/** Insertion order respects FK constraints (parents before children). */
const INSERT_ORDER: TableName[] = [
  'users',
  'categories',
  'category_translations',
  'organization',
  'organization_translations',
  'posts',
  'post_translations',
  'post_comments',
  'organization_stats',
  'organization_stats_translations',
]

/**
 * POST /api/data-management/restore
 *
 * Body shape:
 * {
 *   mode: 'merge' | 'wipe',   // default: 'merge'
 *   ...tables from backup
 * }
 *
 * Conflict strategy per table:
 * ─ organization  → always delete-then-insert (single-row table guarantee)
 * ─ all others    → ignoreDuplicates: true  (INSERT … ON CONFLICT DO NOTHING)
 *                   so rows whose PK or any unique key already exists are skipped silently.
 *
 * Wipe mode:
 *   Deletes ALL rows from each table (except users) in reverse-FK order,
 *   then inserts everything from the backup fresh.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'ملف نسخة احتياطية غير صالح' }, { status: 400 })
  }

  // ── Schema validation ───────────────────────────────────────────────────────
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'بنية ملف النسخة الاحتياطية غير صحيحة' },
      { status: 400 }
    )
  }

  const missingTables = VALID_TABLES.filter((t) => !(t in body))
  if (missingTables.length > 0) {
    return NextResponse.json(
      { error: `مفاتيح مفقودة في ملف النسخة الاحتياطية: ${missingTables.join(', ')}` },
      { status: 400 }
    )
  }

  for (const table of VALID_TABLES) {
    if (!Array.isArray(body[table])) {
      return NextResponse.json(
        { error: `قيمة الجدول "${table}" يجب أن تكون مصفوفة` },
        { status: 400 }
      )
    }
  }

  const mode: 'merge' | 'wipe' = body.mode === 'wipe' ? 'wipe' : 'merge'
  const results: Record<string, { processed: number; skipped?: number; error?: string }> = {}

  // ── Wipe mode: delete all rows first ────────────────────────────────────────
  if (mode === 'wipe') {
    for (const table of WIPE_DELETE_ORDER) {
      // `.not('id', 'is', null)` matches every row (id is always set)
      const { error } = await supabase.from(table).delete().not('id', 'is', null)
      if (error) {
        return NextResponse.json(
          { error: `فشل حذف جدول "${table}" قبل الاستعادة: ${error.message}` },
          { status: 500 }
        )
      }
    }
  }

  // ── Insert / upsert each table ───────────────────────────────────────────────
  for (const table of INSERT_ORDER) {
    const rows: any[] = body[table]
    results[table] = { processed: rows.length }

    if (rows.length === 0) continue

    if (table === 'organization') {
      // Delete child translations first to avoid FK constraints in merge mode
      const { error: delTransError } = await supabase
        .from('organization_translations')
        .delete()
        .not('id', 'is', null)

      if (delTransError) {
        results[table].error = `فشل حذف ترجمات المؤسسة الحالية: ${delTransError.message}`
        continue
      }

      // Single-row table: always delete existing row(s) then insert fresh.
      const { error: delError } = await supabase
        .from('organization')
        .delete()
        .not('id', 'is', null)

      if (delError) {
        results[table].error = `فشل حذف السجل الحالي: ${delError.message}`
        continue
      }

      const { error: insError } = await supabase.from('organization').insert(rows)
      if (insError) {
        results[table].error = insError.message
      }

      continue
    }

    if (mode === 'wipe' && table !== 'users') {
      // After wipe, all rows were deleted — plain insert, no conflict possible.
      // users is excluded: it can never be bulk-deleted (FK → auth.users),
      // so it always falls through to the safe upsert path below.
      const { error } = await supabase.from(table as TableName).insert(rows)
      if (error) results[table].error = error.message
    } else {
      // Merge mode (or users in wipe mode): INSERT … ON CONFLICT DO NOTHING.
      // Skips any row whose primary key OR any unique constraint conflicts.
      const { error } = await supabase
        .from(table as TableName)
        .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

      if (error) results[table].error = error.message
    }
  }

  const failedTables = Object.entries(results)
    .filter(([, v]) => v.error)
    .map(([t, v]) => `${t}: ${v.error}`)

  if (failedTables.length > 0) {
    return NextResponse.json(
      { error: 'اكتملت الاستعادة جزئياً مع أخطاء', details: failedTables, results },
      { status: 207 }
    )
  }

  return NextResponse.json({ success: true, mode, results })
}
