import { clearAuthCookie } from '../../lib/auth.js'
import { successResponse, withErrorHandling } from '../../lib/response.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  clearAuthCookie(res)

  return res.status(200).json(successResponse({ message: 'Logged out successfully' }))
}

export default withErrorHandling(handler)