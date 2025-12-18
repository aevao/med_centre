import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Вебхук для 1С → наш сайт.
 * 1С может сообщить обновления по заявке: статус/врач/комментарий.
 *
 * Защита: простой ключ в заголовке X-API-Key (ONEC_WEBHOOK_KEY).
 */
export async function POST(request: NextRequest) {
  try {
    const requiredKey = process.env.ONEC_WEBHOOK_KEY
    if (requiredKey) {
      const got = request.headers.get('x-api-key')
      if (got !== requiredKey) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { requestId, status, masterId, comment } = body ?? {}

    if (!requestId || typeof requestId !== 'number') {
      return NextResponse.json({ error: 'requestId:number is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (typeof status === 'string') updateData.status = status
    if (typeof masterId === 'number') updateData.masterId = masterId
    if (status === 'завершена') updateData.completedAt = new Date()

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: updateData,
    })

    if (comment && typeof comment === 'string') {
      // authorId обязателен в схеме. Для интеграции проще создать "тех. пользователя" и использовать его.
      // Пока — просто игнорируем комментарий, чтобы не ломать вебхук.
      console.warn('[1C webhook] comment ignored (needs integration user)', { requestId })
    }

    return NextResponse.json({ ok: true, request: updated })
  } catch (e) {
    console.error('[1C webhook] error', e)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}


