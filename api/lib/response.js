export function successResponse(data, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, ...data }),
  }
}

export function errorResponse(message, status = 400, errors = null) {
  const body = { success: false, message }
  if (errors) body.errors = errors
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export function handleApiError(error, res) {
  console.error('API Error:', error)

  if (error.name === 'ValidationError') {
    return errorResponse(error.message, 400, error.errors)
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0]
    return errorResponse(`${field} already exists`, 409)
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return errorResponse('Invalid or expired token', 401)
  }

  return errorResponse(error.message || 'Internal server error', 500)
}

export async function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      await handler(req, res)
    } catch (error) {
      const response = handleApiError(error, res)
      res.status(response.statusCode).json(JSON.parse(response.body))
    }
  }
}