import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    if (user.role === 'CLIENT') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    // Статистика по статусам
    const statusStats = await prisma.request.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    // Статистика по врачам (роль MASTER остаётся техническим обозначением)
    const masterStats = await prisma.request.groupBy({
      by: ['masterId'],
      where: {
        masterId: { not: null }
      },
      _count: { masterId: true }
    })

    // Получаем имена врачей
    const masterIds = masterStats.map(s => s.masterId).filter(Boolean) as number[]
    const masters = await prisma.user.findMany({
      where: { id: { in: masterIds } },
      select: { id: true, name: true }
    })

    const masterStatsWithNames = masterStats.map(stat => ({
      masterId: stat.masterId,
      masterName: masters.find(m => m.id === stat.masterId)?.name || 'Неизвестно',
      count: stat._count.masterId
    }))

    // Среднее время обработки
    const completedRequests = await prisma.request.findMany({
      where: {
        completedAt: { not: null },
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    })

    let avgProcessingTime = 0
    if (completedRequests.length > 0) {
      const totalTime = completedRequests.reduce((sum, req) => {
        if (req.completedAt && req.createdAt) {
          return sum + (req.completedAt.getTime() - req.createdAt.getTime())
        }
        return sum
      }, 0)
      avgProcessingTime = totalTime / completedRequests.length / (1000 * 60 * 60) // в часах
    }

    // Общее количество заявок
    const totalRequests = await prisma.request.count()

    return NextResponse.json({
      statusStats: statusStats.map(s => ({
        status: s.status,
        count: s._count.status
      })),
      masterStats: masterStatsWithNames,
      avgProcessingTime: Math.round(avgProcessingTime * 100) / 100,
      totalRequests
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении статистики' },
      { status: 500 }
    )
  }
}

