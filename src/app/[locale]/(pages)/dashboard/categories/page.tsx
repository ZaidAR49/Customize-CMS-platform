import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { categoriesService } from '@/lib/services/categories.service';
import { CategoriesManager } from '@/components/dashboard/categories/CategoriesManager';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function DashboardCategoriesPage() {
  const t = await getTranslations('dashboardCategories');
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';

  let categories: Awaited<ReturnType<typeof categoriesService.getAllCategories>> = [];
  try {
    categories = await categoriesService.getAllCategories();
  } catch (e) {
    console.error(e);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">{t('title')}</h2>
        <p className="mt-1 text-sm text-(--fcps-gray-text)">
          {t('description')}
        </p>
      </div>
      <CategoriesManager initialCategories={categories} isAdmin={isAdmin} />
    </div>
  );
}

