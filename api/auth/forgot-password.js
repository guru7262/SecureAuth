import { getCollection } from '../../lib/mongodb.js'
import { validate, forgotPasswordSchema } from '../../lib/validation.js'
import { successResponse, errorResponse, withErrorHandling } from '../../lib/response.js'
import crypto from 'crypto'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('Method not allowed', 405))
  }

  const validatedData = validate(forgotPasswordSchema)(req.body)
  const { email } = validatedData

  const usersCollection = await getCollection('users')

  const user = await usersCollection.findOne({ email })
  if (!user) {
    return res.status(200).json(successResponse({
      message: 'If an account exists, a reset link has been sent',
    }))
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenExpiry = new Date(Date.now() + 3600000)

  await usersCollection.updateOne(
    { _id: user._id },
    { $set: { resetToken, resetTokenExpiry } }
  )

  console.log(`[DEV] Password reset token for ${email}: ${resetToken}`)
  console.log(`[DEV] Reset link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`)

  return res.status(200).json(successResponse({
    message: 'If an account exists, a reset link has been sent',
  }))
}

export default withErrorHandling(handler)