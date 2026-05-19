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

interface CategoriesManagerProps {
  initialCategories: CategoryRow[];
  isAdmin: boolean;
}

export function CategoriesManager({ initialCategories, isAdmin }: CategoriesManagerProps) {
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
        toast.success('تم حذف التصنيف');
      } else {
        toast.error(result.error ?? 'تعذّر حذف التصنيف');
      }
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء الحذف');
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
          toast.success('تم تحديث التصنيف');
        } else {
          toast.error(result.error ?? 'تعذّر تحديث التصنيف');
        }
      } else {
        const result = await createCategoryAction(data);
        if (result.success && result.data) {
          setCategories((prev) => [...prev, result.data!]);
          setIsDialogOpen(false);
          toast.success('تم إنشاء التصنيف');
        } else {
          toast.error(result.error ?? 'تعذّر إنشاء التصنيف');
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء الحفظ');
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
            إضافة تصنيف
          </Button>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="bg-(--fcps-bg-soft) hover:bg-(--fcps-bg-soft)">
              <TableHead className="w-[100px] text-right font-semibold text-(--fcps-dark)">المفتاح</TableHead>
              <TableHead className="text-right font-semibold text-(--fcps-dark)">الاسم (عربي)</TableHead>
              <TableHead className="text-right font-semibold text-(--fcps-dark)">الترتيب</TableHead>
              {isAdmin && <TableHead className="text-right font-semibold text-(--fcps-dark)">الإجراءات</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} className="text-center text-(--fcps-gray-text) h-32">
                  لا توجد تصنيفات.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id} className="group">
                  <TableCell className="font-medium font-mono text-sm" dir="rtl">{cat.key}</TableCell>
                  <TableCell>{cat.label_ar}</TableCell>
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
                          title="تعديل التصنيف"
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
                          onClick={() => setCategoryToDelete(cat)}
                          title="حذف التصنيف"
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
