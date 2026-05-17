type JoinedUser = { name?: string | null } | null | undefined

/** Resolve display name from a Supabase embedded `users` join (object or single-element array). */
export function pickJoinedUserName(
  joined: JoinedUser | JoinedUser[],
  fallback = '—',
): string {
  const user = Array.isArray(joined) ? joined[0] : joined
  const name = user?.name?.trim()
  return name || fallback
}
