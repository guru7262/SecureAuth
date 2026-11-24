import { getCollection } from '../lib/mongodb.js'
import { validate, loginSchema } from '../lib/validation.js'
import { verifyPassword, generateToken, setAuthCookie } from '../lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../lib/response.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('Method not allowed', 405))
  }

  const validatedData = validate(loginSchema)(req.body)
  const { email, password } = validatedData

  // ───── Demo Account Bypass ─────
  const isDemoEmail = ['demo@sentinel.security', 'demo@secureauth.com', 'demo@example.com'].includes(email.toLowerCase())
  if (isDemoEmail) {
    const demoUser = {
      id: 'demo-user-id',
      name: 'Demo Account',
      email: email.toLowerCase(),
      isDemo: true,
      createdAt: new Date().toISOString(),
    }

    const token = generateToken({
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      isDemo: true,
    })

    setAuthCookie(res, token)

    return res.status(200).json(successResponse({ user: demoUser }))
  }

  const usersCollection = await getCollection('users')

  const user = await usersCollection.findOne({ email })
  if (!user) {
    return res.status(401).json(errorResponse('Invalid email or password', 401))
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return res.status(401).json(errorResponse('Invalid email or password', 401))
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    isDemo: false,
  })

  setAuthCookie(res, token)

  return res.status(200).json(successResponse({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isDemo: false,
      createdAt: user.createdAt,
    },
  }))
}

export default withErrorHandling(handler)