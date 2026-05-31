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
import type { CategoryRow } from '@/types/category';
import { CategoryDialog } from './CategoryDialog';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/actions/categories.actions';
import { useTranslations, useLocale } from 'next-intl';

interface CategoriesManagerProps {
  initialCategories: CategoryRow[];
  isAdmin: boolean;
}

export function CategoriesManager({ initialCategories, isAdmin }: CategoriesManagerProps) {
  const t = useTranslations('dashboardCategories');
  const locale = useLocale();
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRow | null>(null);
  const [pending, setPending] = useState(false);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cat: CategoryRow) => {
    setEditingCategory(cat);
    setIsDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!isAdmin || !categoryToDelete) return;
    const id = categoryToDelete.id;
    try {
      setPending(true);
      const result = await deleteCategoryAction(id);
      if (result.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setCategoryToDelete(null);
        toast.success(t('successDelete'));
      } else {
        toast.error(result.error ?? t('errorDelete'));
      }
    } catch (e) {
      console.error(e);
      toast.error(t('errorGeneric'));
    } finally {
      setPending(false);
    }
  };

  const handleSave = async (data: Partial<CategoryRow>) => {
    try {
      setPending(true);
      if (editingCategory) {
        const result = await updateCategoryAction(editingCategory.id, data);
        if (result.success && result.data) {
          setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? result.data! : c)));
          setIsDialogOpen(false);
          toast.success(t('successUpdate'));
        } else {
          toast.error(result.error ?? t('errorUpdate'));
        }
      } else {
        const result = await createCategoryAction(data);
        if (result.success && result.data) {
          setCategories((prev) => [...prev, result.data!]);
          setIsDialogOpen(false);
          toast.success(t('successCreate'));
        } else {
          toast.error(result.error ?? t('errorCreate'));
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(t('errorGeneric'));
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
            {t('addCategory')}
          </Button>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <TableHeader>
            <TableRow className="bg-(--fcps-bg-soft) hover:bg-(--fcps-bg-soft)">
              <TableHead className={`w-[100px] font-semibold text-(--fcps-dark) ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.key')}</TableHead>
              <TableHead className={`font-semibold text-(--fcps-dark) ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.nameAr')}</TableHead>
              <TableHead className={`font-semibold text-(--fcps-dark) ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.nameEn')}</TableHead>
              <TableHead className={`font-semibold text-(--fcps-dark) ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.order')}</TableHead>
              {isAdmin && <TableHead className={`font-semibold text-(--fcps-dark) ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-(--fcps-gray-text) h-32">
                  {t('noCategories')}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id} className="group">
                  <TableCell className="font-medium font-mono text-sm" dir="ltr">{cat.key}</TableCell>
                  <TableCell>{cat.label_ar}</TableCell>
                  <TableCell>{cat.label_en || '-'}</TableCell>
                  <TableCell>{cat.display_order}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-(--fcps-gray-text) hover:text-(--fcps-primary)"
                          onClick={() => handleOpenEdit(cat)}
                          title={t('editCategory')}
                          disabled={pending}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="text-xs">{t('editCategory')}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-(--fcps-gray-text) hover:text-red-600 disabled:opacity-40"
                          onClick={() => setCategoryToDelete(cat)}
                          title={t('deleteCategory')}
                          disabled={pending}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-xs">{t('deleteCategory')}</span>
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

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={editingCategory}
        onSave={handleSave}
        pending={pending}
      />

      <DeleteCategoryDialog
        category={categoryToDelete}
        pending={pending}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        onConfirm={confirmDeleteCategory}
      />
    </div>
  );
}

