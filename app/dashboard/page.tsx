import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle,
  Clock,
  FileText,
  ListChecks,
  Plus,
  UserPlus,
  Wrench,
} from 'lucide-react'

async function getDashboardData(userId: number, role: string) {
  const where: any = {}

  if (role === 'CLIENT') {
    where.clientId = userId
  } else if (role === 'MASTER') {
    where.masterId = userId
  }

  const [total, newStatus, inWork, completed, cancelled, recent] = await Promise.all([
    prisma.request.count({ where }),
    prisma.request.count({ where: { ...where, status: 'новая' } }),
    prisma.request.count({ where: { ...where, status: 'в работе' } }),
    prisma.request.count({ where: { ...where, status: 'завершена' } }),
    prisma.request.count({ where: { ...where, status: 'отменена' } }),
    prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        status: true,
        createdAt: true,
        serviceName: true,
        description: true,
        clientName: true,
      },
    }),
  ])

  return { total, newStatus, inWork, completed, cancelled, recent }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const stats = await getDashboardData(user.userId, user.role)

  const roleLabel =
    user.role === 'ADMIN' ? 'Администратор' : user.role === 'MASTER' ? 'Врач' : 'Пациент'

  const kpis = [
    {
      title: 'Всего заявок',
      value: stats.total,
      icon: FileText,
      hint: 'Все обращения в системе',
    },
    {
      title: 'Новые',
      value: stats.newStatus,
      icon: CalendarCheck,
      hint: 'Ожидают обработки',
    },
    {
      title: 'В работе',
      value: stats.inWork,
      icon: ListChecks,
      hint: 'В процессе согласования',
    },
    {
      title: 'Завершено',
      value: stats.completed,
      icon: CheckCircle,
      hint: 'Успешно закрытые',
    },
  ]

  const quickActions = [
    {
      title: 'Записи / обращения',
      text: 'Список заявок, фильтры, статусы и комментарии.',
      href: '/requests',
      icon: ArrowUpRight,
    },
    ...(user.role !== 'CLIENT'
      ? [
          {
            title: 'Услуги',
            text: 'Управляйте справочником услуг и доступностью.',
            href: '/equipment',
            icon: Wrench,
          },
        ]
      : []),
    ...(user.role === 'ADMIN'
      ? [
          {
            title: 'Пользователи',
            text: 'Добавляйте сотрудников и управляйте ролями.',
            href: '/users',
            icon: UserPlus,
          },
          {
            title: 'Статистика',
            text: 'Аналитика по заявкам и нагрузке врачей.',
            href: '/stats',
            icon: ArrowUpRight,
          },
        ]
      : []),
  ]

  return (
    <>
      <Navbar userRole={user.role} />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_28px_100px_-80px_rgba(2,6,23,0.65)] backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">панель</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Панель управления</h1>
              <p className="mt-2 text-slate-600">
                Добро пожаловать, <span className="font-semibold text-slate-950">{user.name}</span>. Роль: {roleLabel}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/requests">
                  <Plus className="mr-2 h-4 w-4" />
                  Новая заявка
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/requests">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Открыть заявки
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">{kpi.title}</CardTitle>
                    <CardDescription className="text-slate-600">{kpi.hint}</CardDescription>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-slate-950">{kpi.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-slate-950">Последние обращения</CardTitle>
              <CardDescription>Свежие заявки, созданные в системе</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {stats.recent.length === 0 ? (
                  <div className="rounded-2xl border border-white/40 bg-white/55 p-6 text-sm text-slate-600 shadow-sm backdrop-blur">
                    Пока нет заявок.
                  </div>
                ) : (
                  stats.recent.map((r) => (
                    <Link
                      key={r.id}
                      href={`/requests/${r.id}`}
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur transition hover:bg-white/70"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950">Заявка #{r.id}</span>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {r.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-slate-700">
                          {r.serviceName ? <span className="font-semibold">{r.serviceName}: </span> : null}
                          {r.description}
                        </div>
                        <div className="mt-2 text-xs text-slate-600">
                          {r.clientName ? `${r.clientName} · ` : ''}
                          {format(new Date(r.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </div>
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:text-primary" />
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-950">Быстрые разделы</CardTitle>
              <CardDescription>Переход к нужным инструментам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {quickActions.map((a) => {
                  const Icon = a.icon
                  return (
                    <Link
                      key={a.href + a.title}
                      href={a.href}
                      className="group rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur transition hover:bg-white/70"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-950">{a.title}</div>
                        <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-primary" />
                      </div>
                      <div className="mt-1 text-sm text-slate-600">{a.text}</div>
                    </Link>
                  )
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur">
                <div className="text-sm font-semibold text-slate-950">Подсказка</div>
                <div className="mt-1 text-sm text-slate-600">
                  Для управления статусами и комментариями откройте раздел «Записи / обращения».
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

