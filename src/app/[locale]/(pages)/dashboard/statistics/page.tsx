import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { organizationStatsService } from '@/lib/services/organization-stats.service';
import { StatisticsManager } from '@/components/dashboard/statistics/StatisticsManager';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboardStatistics' });
  return { title: t('titleManagement') };
}

export default async function DashboardStatisticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';
  const t = await getTranslations({ locale, namespace: 'dashboardStatistics' });

  let stats: Awaited<ReturnType<typeof organizationStatsService.getAllStats>> = [];
  try {
    stats = await organizationStatsService.getAllStats();
  } catch (e) {
    console.error(e);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">{t('titleManagement')}</h2>
        <p className="mt-1 text-sm text-(--fcps-gray-text)">
          {t('description')}
        </p>
      </div>
      <StatisticsManager initialStats={stats} isAdmin={isAdmin} />
    </div>
  );
}
