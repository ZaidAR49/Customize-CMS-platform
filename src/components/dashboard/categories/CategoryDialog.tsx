'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CategoryRow } from '@/types/category';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryRow | null;
  onSave: (data: Partial<CategoryRow>) => void;
  pending: boolean;
}

export function CategoryDialog({ open, onOpenChange, category, onSave, pending }: CategoryDialogProps) {
  const [formData, setFormData] = useState<Partial<CategoryRow>>({});

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        key: '',
        label_ar: '',
        display_order: 0,
        description_ar: '',
        description_en: '',
      });
    }
  }, [category, open]);

  const handleChange = (field: keyof CategoryRow, val: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{category ? 'تعديل تصنيف' : 'إضافة تصنيف'}</DialogTitle>
        </DialogHeader>
        <form id="category-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="cat-key">المفتاح (باللغة الإنجليزية، فريد)</Label>
            <Input
              id="cat-key"
              value={formData.key || ''}
              onChange={(e) => handleChange('key', e.target.value)}
              disabled={pending}
              dir="ltr"
              className="text-left"
              placeholder="e.g. education, health"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cat-label-ar">الاسم (بالعربية)</Label>
            <Input
              id="cat-label-ar"
              value={formData.label_ar || ''}
              onChange={(e) => handleChange('label_ar', e.target.value)}
              disabled={pending}
              required
              placeholder="مثال: التعليم، الصحة"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cat-label-en">الاسم (بالإنجليزية)</Label>
            <Input
              id="cat-label-en"
              value={formData.label_en || ''}
              onChange={(e) => handleChange('label_en', e.target.value)}
              disabled={pending}
              required
              dir="ltr"
              className="text-left"
              placeholder="e.g. Education, Health"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cat-order">الترتيب</Label>
            <Input
              id="cat-order"
              type="number"
              value={formData.display_order ?? 0}
              onChange={(e) => handleChange('display_order', parseInt(e.target.value, 10) || 0)}
              disabled={pending}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cat-desc-ar">وصف إضافي (عربي) - اختياري</Label>
              <Input
                id="cat-desc-ar"
                value={formData.description_ar || ''}
                onChange={(e) => handleChange('description_ar', e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-desc-en">وصف إضافي (إنجليزي) - اختياري</Label>
              <Input
                id="cat-desc-en"
                value={formData.description_en || ''}
                onChange={(e) => handleChange('description_en', e.target.value)}
                disabled={pending}
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>
        </form>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button type="submit" form="category-form" disabled={pending || !formData.key || !formData.label_ar || !formData.label_en}>
            {pending ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
