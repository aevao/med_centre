import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    const where: any = {}

    if (clientId) where.clientId = parseInt(clientId)
    if (status) where.status = status

    // Клиент видит только свою технику
    if (user.role === 'CLIENT') {
      where.clientId = user.userId
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

    return NextResponse.json({ equipment })
  } catch (error) {
    console.error('Get equipment error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении техники' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    if (user.role === 'CLIENT') {
      return NextResponse.json(
        { error: 'Клиенты не могут создавать технику' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, serialNumber, purchaseDate, status, clientId } = body

    if (!name || !serialNumber) {
      return NextResponse.json(
        { error: 'Название и серийный номер обязательны' },
        { status: 400 }
      )
    }

    const equipment = await prisma.equipment.create({
      data: {
        name,
        serialNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        status: status || 'исправна',
        clientId: parseInt(clientId)
      },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ equipment }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Техника с таким серийным номером уже существует' },
        { status: 400 }
      )
    }
    console.error('Create equipment error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании техники' },
      { status: 500 }
    )
  }
}

