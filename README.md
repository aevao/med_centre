# Информационная система электронной заявки в медцентр

Система для электронной записи/обращений в медицинский центр: создание заявок пациентами, назначение врача, статусы, комментарии и email‑уведомления.

## Технологический стек

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (App Router)
- **База данных**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Аутентификация**: JWT через httpOnly cookies

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

3. Инициализируйте базу данных:
```bash
npx prisma generate
npx prisma db push
```

4. (Опционально) Заполните базу данных тестовыми данными:
```bash
npm run db:seed
```

5. Запустите сервер разработки:
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

**Тестовые аккаунты** (после выполнения seed):
- Администратор: `admin@example.com` / `admin123`
- Мастер: `master@example.com` / `master123`
- Клиент: `client@example.com` / `client123`

## Роли пользователей

- **Администратор (ADMIN)**: Полный доступ ко всем функциям системы
- **Мастер (MASTER)**: Управление назначенными заявками, просмотр техники
- **Клиент (CLIENT)**: Создание заявок, просмотр своих заявок

## Основные функции

- ✅ Авторизация и регистрация
- ✅ Электронная заявка/запись в медцентр (создание, просмотр, изменение статуса)
- ✅ Комментарии к заявкам
- ✅ Каталог услуг (раздел переиспользован из "equipment")
- ✅ Управление пользователями (только для админа)
- ✅ Статистика и аналитика с диаграммами
- ✅ Фильтрация заявок по статусу

## Структура проекта

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Панель управления
│   ├── requests/          # Страница заявок
│   ├── equipment/        # Страница техники
│   ├── users/            # Управление пользователями
│   ├── stats/            # Статистика
│   └── login/            # Страница входа
├── components/            # React компоненты
│   ├── ui/               # UI компоненты (shadcn/ui)
│   ├── layout/           # Компоненты layout
│   ├── requests/         # Компоненты заявок
│   ├── equipment/        # Компоненты техники
│   ├── users/            # Компоненты пользователей
│   └── stats/            # Компоненты статистики
├── lib/                   # Утилиты и хелперы
│   ├── auth.ts           # Функции аутентификации
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Утилиты
└── prisma/               # Prisma схема
    └── schema.prisma
```

## Скрипты

- `npm run dev` - Запуск dev сервера
- `npm run build` - Сборка для production
- `npm run start` - Запуск production сервера
- `npm run db:generate` - Генерация Prisma client
- `npm run db:push` - Применение изменений схемы к БД
- `npm run db:studio` - Открыть Prisma Studio

## Безопасность

- JWT токены хранятся в httpOnly cookies
- Пароли хешируются через bcrypt
- Middleware проверяет права доступа к страницам
- API routes защищены проверкой ролей

# med_centre
