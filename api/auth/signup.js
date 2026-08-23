import { getCollection } from '../../lib/mongodb.js'
import { validate, signupSchema } from '../../lib/validation.js'
import { hashPassword, generateToken, setAuthCookie } from '../../lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../../lib/response.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('Method not allowed', 405))
  }

  const validatedData = validate(signupSchema)(req.body)
  const { name, email, password } = validatedData

  const usersCollection = await getCollection('users')

  const existingUser = await usersCollection.findOne({ email })
  if (existingUser) {
    return res.status(409).json(errorResponse('An account with this email already exists', 409))
  }

  const passwordHash = await hashPassword(password)

  const userDoc = {
    name,
    email,
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await usersCollection.insertOne(userDoc)

  const token = generateToken({
    userId: result.insertedId.toString(),
    email,
    name,
  })

  setAuthCookie(res, token)

  return res.status(201).json(successResponse({
    user: {
      id: result.insertedId.toString(),
      name,
      email,
      createdAt: userDoc.createdAt,
    },
  }, 201))
}

export default withErrorHandling(handler)