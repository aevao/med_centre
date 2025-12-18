import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

const publicRoutes = ['/', '/services','/requests']
const authRoutes = ['/login', '/register']
const adminRoutes = ['/users']
const masterRoutes = ['/requests', '/equipment']

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // Пропускаем RSC запросы и статические файлы
  if (searchParams.has('_rsc') || 
      pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/) ||
      pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  try {
    const token = request.cookies.get('token')?.value
    
    const isPublicRoute = publicRoutes.some(route => {
      if (route === '/') {
        return pathname === '/'
      }
      return pathname.startsWith(route)
    })

    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Страницы аутентификации
    if (authRoutes.some(route => pathname.startsWith(route))) {
      if (token) {
        const payload = await verifyToken(token)
        if (payload) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
      return NextResponse.next()
    }

    // Защищённые маршруты - требуют авторизации
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }

    const role = payload.role

    // Проверка доступа к админским страницам
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Проверка доступа к страницам мастера
    if (masterRoutes.some(route => pathname.startsWith(route))) {
      if (role !== 'ADMIN' && role !== 'MASTER') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // В случае ошибки пропускаем запрос
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}