import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
})

export function validate(schema) {
  return (data) => {
    const result = schema.safeParse(data)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      const firstError = Object.values(errors)[0]?.[0] || 'Validation failed'
      const error = new Error(firstError)
      error.status = 400
      error.errors = errors
      throw error
    }
    return result.data
  }
}