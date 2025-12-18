import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  HeartPulse,
  MapPin,
  MessagesSquare,
  Phone,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { AuthModalButton } from '@/components/auth/auth-modal'
import { RequestModal } from '@/components/requests/requestsModal'

const services = [
  {
    id: 'diagnostics',
    title: 'Приём терапевта',
    description: 'Первичная консультация, осмотр и план обследования.',
    price: 'от 1 500 сом',
    duration: '30 минут',
    features: ['Сбор анамнеза', 'Осмотр', 'Рекомендации и назначения']
  },
  {
    id: 'maintenance',
    title: 'УЗИ диагностика',
    description: 'Современная диагностика на оборудовании экспертного класса.',
    price: 'от 2 000 сом',
    duration: '20–40 минут',
    features: ['Быстро', 'Безопасно', 'Заключение в день обращения']
  },
  {
    id: 'repair',
    title: 'Консультация кардиолога',
    description: 'Оценка состояния сердечно‑сосудистой системы и рекомендации.',
    price: 'от 2 500 сом',
    duration: '30–45 минут',
    features: ['ЭКГ по показаниям', 'Разбор анализов', 'План лечения']
  }
]

const stats = [
  { value: '15+', label: 'лет клинической практики' },
  { value: '1200+', label: 'пациентов ежемесячно' },
  { value: '24/7', label: 'онлайн‑заявка без выходных' },
]

const advantages = [
  {
    icon: CalendarCheck,
    title: 'Запись онлайн',
    text: 'Оставьте заявку за 2 минуты — мы подтвердим время и врача.'
  },
  {
    icon: MessagesSquare,
    title: 'Коммуникация',
    text: 'Комментарии к заявке и уведомления — всё в личном кабинете.'
  },
  {
    icon: ShieldCheck,
    title: 'Конфиденциальность',
    text: 'Доступ по ролям и защищённые cookies‑сессии.'
  },
  {
    icon: CreditCard,
    title: 'Прозрачность',
    text: 'Стоимость и детали услуги видны заранее (если указаны).'
  },
]

const steps = [
  { title: 'Выберите услугу', text: 'Откройте каталог и нажмите «Записаться».' },
  { title: 'Заполните данные', text: 'Укажите симптомы и желаемое время визита.' },
  { title: 'Получите подтверждение', text: 'Мы свяжемся и подтвердим запись, статус будет обновляться.' },
]

const faqs = [
  { q: 'Нужно ли регистрироваться?', a: 'Нет. Регистрация понадобится только для просмотра истории и переписки.' },
  { q: 'Как узнать статус заявки?', a: 'В личном кабинете: «Записи / обращения». Также можно получать уведомления на email.' },
  { q: 'Можно ли изменить желаемое время?', a: 'Да. Оставьте комментарий или создайте новую заявку — администратор/врач уточнит детали.' },
]

export default async function Home() {
  const currentUser = await getCurrentUser()
  
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/30 bg-white/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold text-primary">
            Медцентр
          </Link>
          <div className="flex items-center gap-3">
            {currentUser && (
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Личный кабинет</Link>
              </Button>
            )}
            {!currentUser && (
              <AuthModalButton>
                Войти
              </AuthModalButton>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur">
                  <HeartPulse className="h-4 w-4" />
                  Электронная запись и обращения
                </div>

                <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                  Запишитесь в медцентр онлайн — без звонков и очередей
                </h1>

                <p className="text-pretty text-lg text-slate-600">
                  Оставьте заявку на приём, укажите симптомы и удобное время. Статусы и комментарии доступны в личном кабинете.
                </p>

                <div className="flex flex-wrap gap-3">
                  {currentUser ? (
                    <Button asChild size="lg">
                      <Link href="/requests">Перейти к заявкам</Link>
                    </Button>
                  ) : (
                    <AuthModalButton size="lg" redirectTo="/requests">
                      Перейти к заявкам
                    </AuthModalButton>
                  )}

                  <Button asChild variant="outline" size="lg">
                    <Link href="#services">Выбрать услугу</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4">
                  {stats.map((item) => (
                    <div
                      key={item.value}
                      className="rounded-3xl border border-white/40 bg-white/60 p-4 text-center shadow-sm backdrop-blur"
                    >
                      <div className="text-3xl font-semibold text-primary">{item.value}</div>
                      <div className="text-xs font-medium text-slate-600">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_30px_120px_-80px_rgba(2,6,23,0.65)] backdrop-blur">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-950">Быстрый сценарий записи</p>
                    <p className="text-sm text-slate-600">
                      Заявка → подтверждение → визит. Всё прозрачно и под контролем.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {advantages.map(({ icon: Icon, title, text }) => (
                    <div
                      key={title}
                      className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur"
                    >
                      <div className="mt-0.5 rounded-2xl bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-950">{title}</div>
                        <div className="text-sm text-slate-600">{text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="container mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">каталог</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Выберите услугу</h2>
            <p className="mt-3 text-slate-600">Нажмите «Записаться», укажите симптомы и удобное время визита.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="flex flex-col rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_24px_90px_-70px_rgba(2,6,23,0.65)] backdrop-blur">
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-semibold text-slate-950">{service.title}</h3>
                  <p className="text-slate-600">{service.description}</p>
                  <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur">
                    <p className="text-sm text-slate-600">Стоимость</p>
                    <p className="text-xl font-semibold text-primary">{service.price}</p>
                    <p className="text-sm text-slate-600">Длительность: {service.duration}</p>
                  </div>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <RequestModal service={service} />

              </div>
            ))}
          </div>
        </section>

        {/* STEPS */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">сценарий</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Как это работает</h2>
                <p className="mt-3 text-slate-600">Простой процесс — минимум действий, максимум понятности.</p>
              </div>
              <div className="flex gap-2">
                <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur">
                  <Clock className="mr-2 inline h-4 w-4 text-primary" />
                  Среднее время заявки: 2 минуты
                </div>
                <div className="hidden rounded-2xl border border-white/40 bg-white/60 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur md:block">
                  <FileText className="mr-2 inline h-4 w-4 text-primary" />
                  История и статусы
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_20px_80px_-65px_rgba(2,6,23,0.65)] backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                      0{index + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">шаг</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ + CONTACT */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_24px_90px_-70px_rgba(2,6,23,0.65)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">FAQ</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Частые вопросы</h2>
              <div className="mt-6 space-y-4">
                {faqs.map((item) => (
                  <div key={item.q} className="rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur">
                    <div className="font-semibold text-slate-950">{item.q}</div>
                    <div className="mt-1 text-sm text-slate-600">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_24px_90px_-70px_rgba(2,6,23,0.65)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">контакты</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Связаться с медцентром</h2>
              <p className="mt-3 text-slate-600">Для уточнений по записи и подготовке к приёму.</p>
              <div className="mt-6 grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-semibold text-slate-950">Телефон</div>
                    <div className="text-sm text-slate-600">+996 (000) 00‑00‑00</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-semibold text-slate-950">Адрес</div>
                    <div className="text-sm text-slate-600">г. Бишкек, ул. Примерная, 10</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur">
                  <MessagesSquare className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-semibold text-slate-950">Поддержка</div>
                    <div className="text-sm text-slate-600">Ответим в течение рабочего дня</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {currentUser ? (
                  <Button asChild size="lg">
                    <Link href="/requests">Открыть мои заявки</Link>
                  </Button>
                ) : (
                  <AuthModalButton size="lg" redirectTo="/requests">
                    Открыть мои заявки
                  </AuthModalButton>
                )}
                <Button asChild variant="outline" size="lg">
                  <Link href="#services">Выбрать услугу</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* <section className="container mx-auto px-4 py-16">
          <div className="rounded-3xl bg-primary text-primary-foreground">
            <div className="grid gap-8 p-10 md:grid-cols-2 md:items-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/80">Для администраторов</p>
                <h2 className="text-3xl font-bold">Полный контроль заявок и техники в личном кабинете</h2>
                <p className="text-primary-foreground/90">
                  После авторизации доступны панели мониторинга, управление пользователями, заявками и оборудованием.
                </p>
                <div className="flex flex-wrap gap-3">
                  <AuthModalButton variant="secondary">
                    Войти в систему
                  </AuthModalButton>
                  <AuthModalButton
                    variant="ghost"
                    className="text-primary-foreground hover:text-black "
                    mode="register"
                  >
                    Зарегистрировать клиента
                  </AuthModalButton>
                </div>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/10 p-6 text-white">
                <p className="text-sm uppercase tracking-wide text-white/70">Что внутри</p>
                <ul className="mt-4 space-y-3 text-white/90">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Дашборд со статусами заявок
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Мгновенное обновление статусов и комментариев
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Управление пользователями и оборудованием
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      <footer className="border-t border-white/30 bg-white/50 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Медцентр. Все права защищены.</p>
          <div className="flex gap-4">
            <AuthModalButton variant="link" className="h-auto p-0 text-primary hover:text-primary/80">
              Вход
            </AuthModalButton>
            <AuthModalButton
              variant="link"
              className="h-auto p-0 text-primary hover:text-primary/80"
              mode="register"
            >
              Регистрация
            </AuthModalButton>
          </div>
        </div>
      </footer>
    </div>
  )
}

