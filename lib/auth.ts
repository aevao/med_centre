import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { jwtVerify } from 'jose'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TokenPayload {
  userId: number
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

const secret = new TextEncoder().encode(JWT_SECRET)
if (!JWT_SECRET) {
}


export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    
    // Явно преобразуем и проверяем необходимые поля
    const tokenPayload: TokenPayload = {
      userId: Number(payload.userId),
      email: String(payload.email),
      role: String(payload.role)
    }
    
    // Дополнительная валидация
    if (!tokenPayload.userId || !tokenPayload.email || !tokenPayload.role) {
      console.error("❌ Token payload is missing required fields")
      return null
    }
    
    return tokenPayload
  } catch (err: any) {
    console.error("❌ Token verification failed:", err.message)
    return null
  }
}

export async function getCurrentUser(request?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined
  
  if (request) {
    token = request.cookies.get('token')?.value
  } else {
    const cookieStore = await cookies()
    token = cookieStore.get('token')?.value
  }
  
  if (!token) return null
  
  const payload = await verifyToken(token)
  if (!payload) return null

  // Проверяем, что пользователь всё ещё существует
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  })

  if (!user) return null

  return payload
}

