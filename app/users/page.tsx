import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { UsersList } from '@/components/users/users-list'

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
  return users
}

export default async function UsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await getUsers()

  return (
    <>
      <Navbar userRole={user.role} />
      <div className="container mx-auto px-4 py-8">
        <UsersList initialUsers={users} />
      </div>
    </>
  )
}

