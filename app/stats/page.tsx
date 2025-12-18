import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { StatsView } from '@/components/stats/stats-view'

export default async function StatsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'CLIENT') {
    redirect('/dashboard')
  }

  return (
    <>
      <Navbar userRole={user.role} />
      <div className="container mx-auto px-4 py-8">
        <StatsView />
      </div>
    </>
  )
}

