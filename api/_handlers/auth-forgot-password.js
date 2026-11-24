import { getCollection } from '../_lib/mongodb.js'
import { validate, forgotPasswordSchema } from '../_lib/validation.js'
import { generateToken } from '../_lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../_lib/response.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('Method not allowed', 405))
  }

  const validatedData = validate(forgotPasswordSchema)(req.body)
  const { email } = validatedData

  const usersCollection = await getCollection('users')
  const user = await usersCollection.findOne({ email })

  if (user) {
    const resetToken = generateToken({ userId: user._id.toString(), type: 'password-reset' }, '1h')
    console.log(`Password reset link: ${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`)
  }

  return res.status(200).json(successResponse({
    message: 'If an account exists with this email, you will receive password reset instructions.',
  }))
}

export default withErrorHandling(handler)
