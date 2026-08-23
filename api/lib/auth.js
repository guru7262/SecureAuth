import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable')
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${isProduction ? '; Secure' : ''}`)
}

export function clearAuthCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProduction ? '; Secure' : ''}`)
}

export function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  const cookies = req.headers.cookie || ''
  const match = cookies.match(/auth_token=([^;]+)/)
  return match ? match[1] : null
}

export async function authenticateRequest(req) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}