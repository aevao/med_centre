type OneCConfig = {
  baseUrl: string
  apiKey?: string
  username?: string
  password?: string
  timeoutMs: number
}

export type OneCRequestPayload = {
  id: number
  status: string
  createdAt: string
  serviceName?: string | null
  preferredAt?: string | null
  symptoms?: string | null
  description: string
  price?: string | null
  clientName: string
  clientPhone: string
  clientEmail?: string | null
}

function getConfig(): OneCConfig | null {
  const baseUrl = process.env.ONEC_BASE_URL
  if (!baseUrl) return null

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiKey: process.env.ONEC_API_KEY,
    username: process.env.ONEC_USERNAME,
    password: process.env.ONEC_PASSWORD,
    timeoutMs: Number(process.env.ONEC_TIMEOUT_MS || 8000),
  }
}

function buildHeaders(cfg: OneCConfig) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (cfg.apiKey) headers['X-API-Key'] = cfg.apiKey
  if (cfg.username && cfg.password) {
    const encoded = Buffer.from(`${cfg.username}:${cfg.password}`).toString('base64')
    headers['Authorization'] = `Basic ${encoded}`
  }
  return headers
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Пуш заявки в 1С.
 * - Безопасно: если ONEC_BASE_URL не задан, просто ничего не делает.
 * - Не кидает исключение наружу: ошибки логируются.
 */
export async function pushRequestToOneC(payload: OneCRequestPayload, event: 'created' | 'updated') {
  const cfg = getConfig()
  if (!cfg) return { skipped: true as const }

  const endpoint = process.env.ONEC_ENDPOINT_REQUESTS || '/api/requests'
  const url = `${cfg.baseUrl}${endpoint}`

  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: buildHeaders(cfg),
        body: JSON.stringify({ event, request: payload }),
      },
      cfg.timeoutMs
    )

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[1C] push failed', { status: res.status, text })
      return { ok: false as const, status: res.status }
    }

    const data = await res.json().catch(() => null)
    return { ok: true as const, data }
  } catch (e: any) {
    console.error('[1C] push error', e?.message || e)
    return { ok: false as const, error: e?.message || 'unknown' }
  }
}


