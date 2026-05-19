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
import type { OrganizationStatRow } from '@/types/organization';
import { ReadOnlyField } from '@/components/dashboard/ReadOnlyField';
import { Activity, Users, Heart, Star, Award, BookOpen, UserPlus, FileText, Briefcase, HandHeart, Globe } from 'lucide-react';

interface StatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stat: OrganizationStatRow | null;
  onSave: (data: Partial<OrganizationStatRow>) => void;
  pending: boolean;
}

const AVAILABLE_ICONS = [
  { name: 'Activity', icon: Activity },
  { name: 'Users', icon: Users },
  { name: 'Heart', icon: Heart },
  { name: 'HandHeart', icon: HandHeart },
  { name: 'Star', icon: Star },
  { name: 'Award', icon: Award },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'UserPlus', icon: UserPlus },
  { name: 'FileText', icon: FileText },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Globe', icon: Globe },
];

export function StatDialog({ open, onOpenChange, stat, onSave, pending }: StatDialogProps) {
  const [formData, setFormData] = useState<Partial<OrganizationStatRow>>({});

  useEffect(() => {
    if (stat) {
      setFormData(stat);
    } else {
      setFormData({
        key: '',
        label_ar: '',
        value: '',
        icon: 'Activity',
        display_order: 0,
        description_ar: '',
      });
    }
  }, [stat, open]);

  const handleChange = (field: keyof OrganizationStatRow, val: string | number) => {
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
          <DialogTitle>{stat ? 'تعديل إحصائية' : 'إضافة إحصائية'}</DialogTitle>
        </DialogHeader>
        <form id="stat-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
          {stat ? (
            <ReadOnlyField
              id="stat-updated-by"
              label="آخر تحديث بواسطة"
              value={
                stat.updatedByName?.trim() ||
                (stat.updated_by ? 'مستخدم محذوف' : 'غير محدد')
              }
            />
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="stat-key">المفتاح (باللغة الإنجليزية، فريد)</Label>
            <Input
              id="stat-key"
              value={formData.key || ''}
              onChange={(e) => handleChange('key', e.target.value)}
              disabled={pending}
              dir="ltr"
              className="text-left"
              placeholder="e.g. families_served"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stat-label-ar">العنوان</Label>
            <Input
              id="stat-label-ar"
              value={formData.label_ar || ''}
              onChange={(e) => handleChange('label_ar', e.target.value)}
              disabled={pending}
              required
              placeholder="مثال: العائلات المستفيدة"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stat-value">القيمة</Label>
              <Input
                id="stat-value"
                value={formData.value || ''}
                onChange={(e) => handleChange('value', e.target.value)}
                disabled={pending}
                required
                placeholder="مثال: +1000 أو 50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stat-order">الترتيب</Label>
              <Input
                id="stat-order"
                type="number"
                value={formData.display_order ?? 0}
                onChange={(e) => handleChange('display_order', parseInt(e.target.value, 10) || 0)}
                disabled={pending}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stat-icon">الأيقونة</Label>
            <div className="flex gap-2">
              <select
                id="stat-icon"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.icon || ''}
                onChange={(e) => handleChange('icon', e.target.value)}
                disabled={pending}
              >
                <option value="">-- بدون أيقونة --</option>
                {AVAILABLE_ICONS.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                {(() => {
                  const IconComponent = AVAILABLE_ICONS.find(i => i.name === formData.icon)?.icon;
                  return IconComponent ? <IconComponent className="h-5 w-5 text-muted-foreground" /> : '-';
                })()}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stat-desc">وصف إضافي (عربي) - اختياري</Label>
            <Input
              id="stat-desc"
              value={formData.description_ar || ''}
              onChange={(e) => handleChange('description_ar', e.target.value)}
              disabled={pending}
            />
          </div>
        </form>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button type="submit" form="stat-form" disabled={pending || !formData.key || !formData.label_ar || !formData.value}>
            {pending ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
