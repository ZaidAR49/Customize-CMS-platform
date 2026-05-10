import { Card, CardContent } from '@/components/ui/card'
import { PostsTable } from '@/components/dashboard/PostsTable'
import { posts } from '@/data/posts'
import { FileText, Heart, Users, Clock } from 'lucide-react'

const stats = [
  { label: 'إجمالي المقالات', value: posts.length, icon: FileText, color: 'bg-blue-500' },
  { label: 'إجمالي الإعجابات', value: posts.reduce((sum, p) => sum + p.likes, 0), icon: Heart, color: 'bg-red-500' },
  { label: 'المستخدمون', value: 3, icon: Users, color: 'bg-[var(--fcps-primary)]' },
  { label: 'مسودات معلقة', value: 0, icon: Clock, color: 'bg-amber-500' },
]

export default function DashboardPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-[var(--fcps-dark)]">نظرة عامة</h2>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--fcps-gray-text)]">{stat.label}</p>
                <p className="text-2xl font-bold text-[var(--fcps-dark)]">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Posts */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-[var(--fcps-dark)]">آخر المقالات</h3>
        <PostsTable posts={posts.slice(0, 5)} />
      </div>
    </div>
  )
}
