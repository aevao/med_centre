import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Сообщение обязательно' },
        { status: 400 }
      )
    }

    // Проверяем доступ к заявке
    const requestData = await prisma.request.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!requestData) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    if (user.role === 'CLIENT' && requestData.clientId !== user.userId) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    if (user.role === 'MASTER' && requestData.masterId !== user.userId) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const comment = await prisma.comment.create({
      data: {
        message,
        requestId: parseInt(params.id),
        authorId: user.userId
      },
      include: {
        author: {
          select: { id: true, name: true, role: true }
        }
      }
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании комментария' },
      { status: 500 }
    )
  }
}

