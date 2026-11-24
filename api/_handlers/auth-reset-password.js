import { ObjectId } from 'mongodb'
import { getCollection } from '../_lib/mongodb.js'
import { validate, resetPasswordSchema } from '../_lib/validation.js'
import { verifyToken, hashPassword } from '../_lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../_lib/response.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('Method not allowed', 405))
  }

  const validatedData = validate(resetPasswordSchema)(req.body)
  const { token, password } = validatedData

  const decoded = verifyToken(token)
  if (!decoded || decoded.type !== 'password-reset') {
    return res.status(400).json(errorResponse('Invalid or expired reset token', 400))
  }

  const usersCollection = await getCollection('users')
  const passwordHash = await hashPassword(password)

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(decoded.userId) },
    { $set: { passwordHash, updatedAt: new Date() } }
  )

  if (result.matchedCount === 0) {
    return res.status(404).json(errorResponse('User not found', 404))
  }

  return res.status(200).json(successResponse({
    message: 'Password has been reset successfully. You can now sign in with your new password.',
  }))
}

export default withErrorHandling(handler)
