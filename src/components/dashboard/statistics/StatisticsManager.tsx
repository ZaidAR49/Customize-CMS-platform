'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OrganizationStatRow } from '@/types/organization';
import { StatDialog } from './StatDialog';
import { DeleteStatDialog } from './DeleteStatDialog';
import { createOrganizationStatAction, updateOrganizationStatAction, deleteOrganizationStatAction } from '@/actions/organization-stats.actions';

interface StatisticsManagerProps {
  initialStats: OrganizationStatRow[];
  isAdmin: boolean;
}

export function StatisticsManager({ initialStats, isAdmin }: StatisticsManagerProps) {
  const [stats, setStats] = useState<OrganizationStatRow[]>(initialStats);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<OrganizationStatRow | null>(null);
  const [statToDelete, setStatToDelete] = useState<OrganizationStatRow | null>(null);
  const [pending, setPending] = useState(false);

  const handleOpenAdd = () => {
    setEditingStat(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (stat: OrganizationStatRow) => {
    setEditingStat(stat);
    setIsDialogOpen(true);
  };

  const confirmDeleteStat = async () => {
    if (!isAdmin || !statToDelete) return;
    const id = statToDelete.id;
    try {
      setPending(true);
      const result = await deleteOrganizationStatAction(id);
      if (result.success) {
        setStats((prev) => prev.filter((s) => s.id !== id));
        setStatToDelete(null);
        toast.success('تم حذف الإحصائية');
      } else {
        toast.error(result.error ?? 'تعذّر حذف الإحصائية');
      }
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setPending(false);
    }
  };

  const handleSave = async (data: Partial<OrganizationStatRow>) => {
    try {
      setPending(true);
      if (editingStat) {
        const result = await updateOrganizationStatAction(editingStat.id, data);
        if (result.success && result.data) {
          setStats((prev) => prev.map((s) => (s.id === editingStat.id ? result.data! : s)));
          setIsDialogOpen(false);
        } else {
          alert(result.error);
        }
      } else {
        const result = await createOrganizationStatAction(data);
        if (result.success && result.data) {
          setStats((prev) => [...prev, result.data!]);
          setIsDialogOpen(false);
        } else {
          alert(result.error);
        }
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة إحصائية
          </Button>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="bg-(--fcps-bg-soft) hover:bg-(--fcps-bg-soft)">
              <TableHead className="w-[100px] text-right font-semibold text-(--fcps-dark)">المفتاح</TableHead>
              <TableHead className="text-right font-semibold text-(--fcps-dark)">العنوان (عربي)</TableHead>
              <TableHead className="text-right font-semibold text-(--fcps-dark)">القيمة</TableHead>
              <TableHead className="text-right font-semibold text-(--fcps-dark)">الأيقونة</TableHead>
              <TableHead className="text-right font-semibold text-(--fcps-dark)">الترتيب</TableHead>
              {isAdmin && <TableHead className="text-right font-semibold text-(--fcps-dark)">الإجراءات</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-(--fcps-gray-text) h-32">
                  لا توجد إحصائيات.
                </TableCell>
              </TableRow>
            ) : (
              stats.map((stat) => (
                <TableRow key={stat.id} className="group">
                  <TableCell className="font-medium">{stat.key}</TableCell>
                  <TableCell>{stat.label_ar}</TableCell>
                  <TableCell>{stat.value}</TableCell>
                  <TableCell>{stat.icon || '-'}</TableCell>
                  <TableCell>{stat.display_order}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-(--fcps-gray-text) hover:text-(--fcps-primary)"
                          onClick={() => handleOpenEdit(stat)}
                          title="تعديل الإحصائية"
                          disabled={pending}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="text-xs">تعديل</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-(--fcps-gray-text) hover:text-red-600 disabled:opacity-40"
                          onClick={() => setStatToDelete(stat)}
                          title="حذف الإحصائية"
                          disabled={pending}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-xs">حذف</span>
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StatDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        stat={editingStat}
        onSave={handleSave}
        pending={pending}
      />

      <DeleteStatDialog
        stat={statToDelete}
        pending={pending}
        onOpenChange={(open) => {
          if (!open) setStatToDelete(null);
        }}
        onConfirm={confirmDeleteStat}
      />
    </div>
  );
}
