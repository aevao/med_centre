import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import RequestsList from '@/components/requests/requests-list'

async function getRequests(userId?: number, role?: string) {
  const where: any = {}

  if (role === 'CLIENT' && userId) {
    where.clientId = userId
  } else if (role === 'MASTER' && userId) {
    where.masterId = userId
  }

  const requests = await prisma.request.findMany({
    where,
    include: {
      client: {
        select: { id: true, name: true, email: true }
      },
      master: {
        select: { id: true, name: true, email: true }
      },
      equipment: {
        select: { id: true, name: true, serialNumber: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return requests
}

export default async function RequestsPage() {
  const user = await getCurrentUser()
  
  // Проверка: если пользователь мастер, он должен быть авторизован
  if (user?.role === 'MASTER' && !user.userId) {
    redirect('/login')
  }

  async function getMasters() {
    const masters = await prisma.user.findMany({
      where: { role: "MASTER" },
      select: { id: true, name: true, email: true },
    });
    return masters;
  }

  const masters = await getMasters();

  // Получаем заявки, если пользователь авторизован
  const requests = await getRequests(user?.userId, user?.role)

  return (
    <>
      <Navbar userRole={user?.role || 'CLIENT'} />
      <div className="container mx-auto px-4 py-8">
        <RequestsList
          initialRequests={requests}
          userRole={user?.role || 'CLIENT'}
          userId={user?.userId || 0}
          masters={masters}
        />
      </div>
    </>
  )
}
