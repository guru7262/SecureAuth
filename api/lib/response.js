export function successResponse(data, status = 200) {
  return { success: true, ...data }
}

export function errorResponse(message, status = 400, errors = null) {
  const body = { success: false, message }
  if (errors) body.errors = errors
  return body
}

export function handleApiError(error) {
  console.error('API Error:', error)

  if (error.name === 'ValidationError') {
    return { status: 400, body: { success: false, message: error.message, errors: error.errors } }
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0]
    return { status: 409, body: { success: false, message: `${field} already exists` } }
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return { status: 401, body: { success: false, message: 'Invalid or expired token' } }
  }

  return { status: 500, body: { success: false, message: error.message || 'Internal server error' } }
}

export async function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      await handler(req, res)
    } catch (error) {
      const { status, body } = handleApiError(error)
      res.status(status).json(body)
    }
  }
}