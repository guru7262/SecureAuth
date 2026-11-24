import { clearAuthCookie } from '../_lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../_lib/response.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('Method not allowed', 405))
  }

  clearAuthCookie(res)

  return res.status(200).json(successResponse({ message: 'Logged out successfully' }))
}

export default withErrorHandling(handler)
