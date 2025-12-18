import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function main() {
  console.log('Начало заполнения базы данных...')

  try {
    // Очищаем существующие данные (опционально)
    await prisma.request.deleteMany()
    await prisma.equipment.deleteMany()
    await prisma.user.deleteMany()

    // Создаём администратора
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Администратор',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN'
      }
    })

    // Создаём врача (роль MASTER остаётся в коде как техническое обозначение)
    const master = await prisma.user.upsert({
      where: { email: 'master@example.com' },
      update: {},
      create: {
        name: 'Иван Врачев',
        email: 'master@example.com',
        password: await bcrypt.hash('master123', 10),
        role: 'MASTER'
      }
    })

    // Создаём клиента
    const client = await prisma.user.upsert({
      where: { email: 'client@example.com' },
      update: {},
      create: {
        name: 'Петр Клиентов',
        email: 'client@example.com',
        password: await bcrypt.hash('client123', 10),
        role: 'CLIENT'
      }
    })

    console.log('Пользователи созданы:', { admin, master, client })

    // Создаём услуги (таблица Equipment переиспользуется как справочник услуг)
    const equipment = await prisma.equipment.upsert({
      where: { serialNumber: 'THERAPY-01' },
      update: {},
      create: {
        name: 'Приём терапевта',
        serialNumber: 'THERAPY-01',
        status: 'активна',
        clientId: master.id,
        purchaseDate: new Date()
      }
    })

    console.log('Техника создана:', equipment)

    // Создаём тестовую заявку (электронная запись/обращение)
    const request = await prisma.request.create({
      data: {
        description: 'Нужна консультация, повышенное давление последние 3 дня',
        serviceName: 'Приём терапевта',
        preferredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        symptoms: 'Головная боль, слабость',
        status: 'новая',
        clientName: client.name,
        clientPhone: '+996700000000',
        clientEmail: client.email,
        price: '1500',
        clientId: client.id,
        equipmentId: equipment.id
      }
    })

    console.log('Заявка создана:', request)

    console.log('База данных успешно заполнена!')
    console.log('\nТестовые аккаунты:')
    console.log('Администратор: admin@example.com / admin123')
    console.log('Врач: master@example.com / master123')
    console.log('Клиент: client@example.com / client123')

  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })