import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { EquipmentList } from '@/components/equipment/equipment-list'

async function getEquipment(userId: number, role: string) {
  const where: any = {}

  if (role === 'CLIENT') {
    where.clientId = userId
  }

  const equipment = await prisma.equipment.findMany({
    where,
    include: {
      client: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return equipment
}

async function getClients() {
  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, name: true, email: true }
  })
  return clients
}

export default async function EquipmentPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'CLIENT') {
    redirect('/dashboard')
  }

  const equipment = await getEquipment(user.userId, user.role)
  const clients = await getClients()

  return (
    <>
      <Navbar userRole={user.role} />
      <div className="container mx-auto px-4 py-8">
        <EquipmentList initialEquipment={equipment} clients={clients} />
      </div>
    </>
  )
}

