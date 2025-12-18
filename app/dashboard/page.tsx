import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react'

async function getDashboardData(userId: number, role: string) {
  const where: any = {}

  if (role === 'CLIENT') {
    where.clientId = userId
  } else if (role === 'MASTER') {
    where.masterId = userId
  }

  const [total, newStatus, inWork, completed, cancelled] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.count({ where: { ...where, status: 'новая' } }),
    prisma.request.count({ where: { ...where, status: 'в работе' } }),
    prisma.request.count({ where: { ...where, status: 'завершена' } }),
    prisma.request.count({ where: { ...where, status: 'отменена' } })
  ])

  return { total, newStatus, inWork, completed, cancelled }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const stats = await getDashboardData(user.userId, user.role)

  return (
    <>
      <Navbar userRole={user.role} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Панель управления</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего заявок
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Новые
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newStatus}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                В работе
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inWork}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Завершено
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

