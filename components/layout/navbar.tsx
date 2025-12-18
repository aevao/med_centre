'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  Users, 
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  userRole: string
}

export function Navbar({ userRole }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast({
        title: 'Выход выполнен',
        description: 'Вы успешно вышли из системы'
      })
      setIsMobileMenuOpen(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выйти',
        variant: 'destructive'
      })
    }
  }

  const navItems = [
    { href: '/dashboard', label: 'Панель', icon: LayoutDashboard, roles: ['ADMIN', 'MASTER', 'CLIENT'] },
    { href: '/requests', label: 'Записи / обращения', icon: FileText, roles: ['ADMIN', 'MASTER', 'CLIENT'] },
    { href: '/equipment', label: 'Услуги', icon: Wrench, roles: ['ADMIN', 'MASTER'] },
    { href: '/users', label: 'Пользователи', icon: Users, roles: ['ADMIN'] },
    { href: '/stats', label: 'Статистика', icon: BarChart3, roles: ['ADMIN', 'MASTER'] },
  ]

  const visibleItems = navItems.filter(item => item.roles.includes(userRole))
  const roleLabel = userRole === 'ADMIN' ? 'Админ' : userRole === 'MASTER' ? 'Врач' : 'Пациент'

  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity md:hidden",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 transform border-r border-white/30 bg-white/70 backdrop-blur-xl transition-transform duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/30">
            <span className="text-base font-semibold text-slate-900">Навигация</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-700 hover:bg-white/70 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer with Logout */}
          <div className="p-4 border-t border-white/30">
            <Button
              variant="outline"
              className="w-full justify-start rounded-2xl bg-white/60 backdrop-blur"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Floating pill navbar (desktop) */}
      <nav className="sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <div className="hidden md:flex items-center justify-between rounded-[999px] border border-white/35 bg-white/55 px-3 py-2 shadow-[0_18px_70px_-55px_rgba(15,23,42,0.7)] backdrop-blur-xl">
              <Link href="/dashboard" className="group flex items-center gap-2 px-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <span className="text-sm font-bold">MC</span>
                </span>
                <span className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-slate-950">
                  Медцентр Ви
                </span>
              </Link>

              <div className="flex items-center gap-1 rounded-[999px] bg-white/50 p-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-[999px] px-4 py-2 text-sm font-medium transition",
                        active
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-700 hover:bg-white hover:text-slate-950"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden lg:inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {roleLabel}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="rounded-[999px] bg-white/60 backdrop-blur"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выход
                </Button>
              </div>
            </div>

            {/* Mobile topbar */}
            <div className="flex md:hidden items-center justify-between rounded-3xl border border-white/35 bg-white/55 px-3 py-2 shadow-[0_18px_70px_-55px_rgba(15,23,42,0.7)] backdrop-blur-xl">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Link href="/dashboard" className="group flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <span className="text-sm font-bold">MC</span>
                </span>
                <span className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-slate-950">
                  Медцентр Ви
                </span>
              </Link>

              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </>
  )
}