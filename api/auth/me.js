import { ObjectId } from 'mongodb'
import { getCollection } from '../lib/mongodb.js'
import { authenticateRequest } from '../lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../lib/response.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json(errorResponse('Method not allowed', 405))
  }

  const decoded = await authenticateRequest(req)
  if (!decoded) {
    return res.status(401).json(errorResponse('Not authenticated', 401))
  }

  const usersCollection = await getCollection('users')

  const user = await usersCollection.findOne(
    { _id: new ObjectId(decoded.userId) },
    { projection: { passwordHash: 0 } }
  )

  if (!user) {
    return res.status(404).json(errorResponse('User not found', 404))
  }

  return res.status(200).json(successResponse({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  }))
}

export default withErrorHandling(handler)