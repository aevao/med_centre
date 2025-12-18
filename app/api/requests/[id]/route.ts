import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import sgMail from '@sendgrid/mail'
import { pushRequestToOneC } from '@/lib/integrations/oneC'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const requestData = await prisma.request.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        master: {
          select: { id: true, name: true, email: true }
        },
        equipment: {
          select: { id: true, name: true, serialNumber: true, status: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!requestData) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    // Проверка доступа
    if (user.role === 'CLIENT' && requestData.clientId !== user.userId) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    if (user.role === 'MASTER' && requestData.masterId !== user.userId) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    return NextResponse.json({ request: requestData })
  } catch (error) {
    console.error('Get request error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заявки' },
      { status: 500 }
    )
  }
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    if (user.role === 'CLIENT') {
      return NextResponse.json(
        { error: 'Клиенты не могут редактировать заявки' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, masterId, description, serviceName, preferredAt, symptoms } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (masterId) updateData.masterId = parseInt(masterId)
    if (description) updateData.description = description
    if (serviceName !== undefined) updateData.serviceName = serviceName || null
    if (preferredAt !== undefined) updateData.preferredAt = preferredAt ? new Date(preferredAt) : null
    if (symptoms !== undefined) updateData.symptoms = symptoms || null

    if (status === 'завершена' || status === 'завершена') {
      updateData.completedAt = new Date()
    }

    const requestData = await prisma.request.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        master: {
          select: { id: true, name: true, email: true }
        },
        equipment: {
          select: { id: true, name: true, serialNumber: true }
        }
      }
    })

    // Пуш обновления в 1С (fire-and-forget)
    void pushRequestToOneC(
      {
        id: requestData.id,
        status: requestData.status,
        createdAt: requestData.createdAt.toISOString(),
        serviceName: requestData.serviceName,
        preferredAt: requestData.preferredAt ? requestData.preferredAt.toISOString() : null,
        symptoms: requestData.symptoms,
        description: requestData.description,
        price: requestData.price,
        clientName: requestData.clientName,
        clientPhone: requestData.clientPhone,
        clientEmail: requestData.clientEmail,
      },
      'updated'
    )
    const { clientEmail, id , price , clientName} = requestData
    if (clientEmail) {
          const url = `${process.env.APP_URL}/requests/${id}`;
          const msg = {
            to: clientEmail,
            from: process.env.EMAIL_FROM!,
            subject: "Ваша заявка в медцентр обновлена",
            html: `
              <h2>Здравствуйте, ${clientName}!</h2>
              <p>Статус вашей заявки в медицинский центр был обновлен:</p>
              <ul>
                <li>ID заявки: ${id}</li>
                <li>Услуга/направление: ${requestData.serviceName || "не указано"}</li>
                <li>Желаемая дата/время: ${requestData.preferredAt ? new Date(requestData.preferredAt).toLocaleString("ru-RU") : "не указано"}</li>
                <li>Симптомы: ${requestData.symptoms || "не указаны"}</li>
                <li>Описание: ${requestData.description}</li>
                <li>Стоимость: ${price || "не указана"}</li>
                <li>Новый статус: ${requestData.status}</li>
              </ul>
              <p>Вы можете отслеживать статус вашей заявки по ссылке: 
              <a href="${url}">${url}</a></p>
              <p>Спасибо! Если нужно, мы свяжемся с вами для уточнения деталей.</p>
            `,
          };
          await sgMail.send(msg);
        }

    return NextResponse.json({ request: requestData })
  } catch (error) {
    console.error('Update request error:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении заявки' },
      { status: 500 }
    )
  }
}

