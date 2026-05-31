import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { organizationStatsService } from '@/lib/services/organization-stats.service';
import { StatisticsManager } from '@/components/dashboard/statistics/StatisticsManager';

export const dynamic = 'force-dynamic';

export default async function DashboardStatisticsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';

  let stats: Awaited<ReturnType<typeof organizationStatsService.getAllStats>> = [];
  try {
    stats = await organizationStatsService.getAllStats();
  } catch (e) {
    console.error(e);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">إدارة الإحصائيات</h2>
        <p className="mt-1 text-sm text-(--fcps-gray-text)">
          عرض الإحصائيات والأرقام المهمة للمنظمة؛ يمكن للمسؤول إضافة، تعديل، أو حذف الإحصائيات التي تظهر في واجهة الموقع.
        </p>
      </div>
      <StatisticsManager initialStats={stats} isAdmin={isAdmin} />
    </div>
  );
}
