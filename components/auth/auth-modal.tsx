'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AuthMode = 'login' | 'register'

const benefits = [
  { icon: ShieldCheck, title: 'Конфиденциальность', text: 'Данные пациентов защищены и доступны по ролям' },
  { icon: UsersRound, title: 'Командная работа', text: 'Роли: администратор, врач, пациент' },
  { icon: Sparkles, title: 'Запись онлайн', text: 'Заявка на приём, статус и коммуникация в одном месте' },
]

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  redirectTo?: string
  onCloseFallback?: () => void
}

export function AuthModal({
  open,
  onOpenChange,
  mode,
  onModeChange,
  redirectTo = '/dashboard',
  onCloseFallback,
}: AuthModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  })

  const safeRedirect = useMemo(() => (redirectTo?.startsWith('/') ? redirectTo : '/dashboard'), [redirectTo])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log(data)
      if (!response.ok) {
        throw new Error(data.error || 'Что-то пошло не так')
      }

      toast({
        title: mode === 'login' ? 'Вход выполнен' : 'Регистрация успешна',
        description: `Добро пожаловать, ${data.user.name}!`,
      })

      onOpenChange(false)
      router.push(safeRedirect)
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось выполнить запрос',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen && onCloseFallback) {
      onCloseFallback()
    }
  }

  const toggleMode = () => {
    onModeChange(mode === 'login' ? 'register' : 'login')
    setFormData({ name: '', email: '', password: '', role: 'MASTER' })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden border-none bg-transparent p-0 shadow-2xl">
        <div className="grid min-h-[480px] grid-cols-1 md:grid-cols-2">
          <div className="bg-primary text-primary-foreground p-8 md:p-10 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Медицинский центр</p>
              <h2  className="mt-4 text-3xl font-semibold leading-tight">
                Электронная запись и обработка обращений пациентов
              </h2>
              <p className="mt-3 text-sm text-primary-foreground/80">
                Авторизация открывает доступ к личному кабинету, истории обращений и работе сотрудников клиники.
              </p>
            </div>
            <div className="space-y-4">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="rounded-full bg-white/15 p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-primary-foreground/70">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 md:p-10">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-semibold">
                {mode === 'login' ? 'Вход в систему' : 'Регистрация клиента'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {mode === 'login'
                  ? 'Укажите email и пароль, чтобы продолжить'
                  : 'Создайте личный кабинет пациента для записи и отслеживания обращений'}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex items-center gap-2 rounded-full bg-gray-100 p-1">
              <button
                type="button"
                className={cn(
                  'flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  mode === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                )}
                onClick={() => mode !== 'login' && toggleMode()}
              >
                Вход
              </button>
              <button
                type="button"
                className={cn(
                  'flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  mode === 'register'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                )}
                onClick={() => mode !== 'register' && toggleMode()}
              >
                Регистрация
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Обрабатываем...' : mode === 'login' ? 'Войти в систему' : 'Создать аккаунт'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              {mode === 'login' ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}{' '}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={toggleMode}
              >
                {mode === 'login' ? 'Создать аккаунт' : 'Войти'}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface AuthModalButtonProps extends ButtonProps {
  children: React.ReactNode
  mode?: AuthMode
  redirectTo?: string
}

export function AuthModalButton({
  children,
  mode = 'login',
  redirectTo = '/dashboard',
  onClick,
  ...buttonProps
}: AuthModalButtonProps) {
  const [open, setOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<AuthMode>(mode)

  return (
    <>
      <Button
        {...buttonProps}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          setCurrentMode(mode)
          setOpen(true)
        }}
      >
        {children}
      </Button>
      <AuthModal
        open={open}
        onOpenChange={setOpen}
        mode={currentMode}
        onModeChange={setCurrentMode}
        redirectTo={redirectTo}
      />
    </>
  )
}

