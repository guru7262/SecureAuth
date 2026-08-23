import { getCollection } from '../../lib/mongodb.js'
import { validate, resetPasswordSchema } from '../../lib/validation.js'
import { hashPassword } from '../../lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../../lib/response.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('Method not allowed', 405))
  }

  const validatedData = validate(resetPasswordSchema)(req.body)
  const { token, password } = validatedData

  const usersCollection = await getCollection('users')

  const user = await usersCollection.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  })

  if (!user) {
    return res.status(400).json(errorResponse('Invalid or expired reset token', 400))
  }

  const passwordHash = await hashPassword(password)

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash, updatedAt: new Date() },
      $unset: { resetToken: '', resetTokenExpiry: '' },
    }
  )

  return res.status(200).json(successResponse({
    message: 'Password has been reset successfully',
  }))
}

export default withErrorHandling(handler)