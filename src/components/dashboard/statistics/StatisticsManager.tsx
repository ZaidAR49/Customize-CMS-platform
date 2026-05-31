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
import { useTranslations, useLocale } from 'next-intl';

interface StatisticsManagerProps {
  initialStats: OrganizationStatRow[];
  isAdmin: boolean;
}

export function StatisticsManager({ initialStats, isAdmin }: StatisticsManagerProps) {
  const t = useTranslations('dashboardStatistics');
  const locale = useLocale();
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
        toast.success(t('successDelete'));
      } else {
        toast.error(result.error ?? t('errorDelete'));
      }
    } catch (e) {
      console.error(e);
      toast.error(t('errorDeleteGeneric'));
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
      alert(t('errorSaveGeneric'));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className={`flex ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addStat')}
          </Button>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <TableHeader>
            <TableRow className="bg-(--fcps-bg-soft) hover:bg-(--fcps-bg-soft)">
              <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-semibold text-(--fcps-dark)`}>{t('tableKey')}</TableHead>
              <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-semibold text-(--fcps-dark)`}>{locale === 'ar' ? t('tableTitleAr') : t('tableTitleAr')}</TableHead>
              <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-semibold text-(--fcps-dark)`}>{t('tableValue')}</TableHead>
              <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-semibold text-(--fcps-dark)`}>{t('tableIcon')}</TableHead>
              <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-semibold text-(--fcps-dark)`}>{t('tableOrder')}</TableHead>
              {isAdmin && <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-semibold text-(--fcps-dark)`}>{t('tableActions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-(--fcps-gray-text) h-32">
                  {t('emptyStats')}
                </TableCell>
              </TableRow>
            ) : (
              stats.map((stat) => (
                <TableRow key={stat.id} className="group">
                  <TableCell className="font-medium">{stat.key}</TableCell>
                  <TableCell>{locale === 'ar' ? stat.label_ar : stat.label_en || stat.label_ar}</TableCell>
                  <TableCell>{stat.value}</TableCell>
                  <TableCell>{stat.icon || '-'}</TableCell>
                  <TableCell>{stat.display_order}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className={`flex gap-2 ${locale === 'ar' ? '' : 'justify-start'}`}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-(--fcps-gray-text) hover:text-(--fcps-primary)"
                          onClick={() => handleOpenEdit(stat)}
                          title={t('editTitle')}
                          disabled={pending}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="text-xs">{t('editAction')}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-(--fcps-gray-text) hover:text-red-600 disabled:opacity-40"
                          onClick={() => setStatToDelete(stat)}
                          title={t('deleteTitle')}
                          disabled={pending}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-xs">{t('deleteAction')}</span>
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
