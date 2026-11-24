import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Handlers from _handlers (ignored by Vercel Function scanner due to leading underscore)
import signupHandler from './_handlers/auth-signup.js'
import loginHandler from './_handlers/auth-login.js'
import logoutHandler from './_handlers/auth-logout.js'
import meHandler from './_handlers/auth-me.js'
import forgotPasswordHandler from './_handlers/auth-forgot-password.js'
import resetPasswordHandler from './_handlers/auth-reset-password.js'
import websitesHandler from './_handlers/websites.js'
import statsHandler from './_handlers/websites-stats.js'
import trafficHandler from './_handlers/traffic.js'

import { connectToDatabase } from './_lib/mongodb.js'

const app = express()

// Universal CORS handling for cross-origin customer sites & SDKs
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-Requested-With', 'Accept'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

// API Router
const router = express.Router()

// Auth Endpoints
router.all('/auth/signup', signupHandler)
router.all('/auth/login', loginHandler)
router.all('/auth/logout', logoutHandler)
router.all('/auth/me', meHandler)
router.all('/auth/forgot-password', forgotPasswordHandler)
router.all('/auth/reset-password', resetPasswordHandler)

// Website & Stats Endpoints
router.all('/websites/stats', statsHandler)
router.all('/websites', websitesHandler)

// Traffic Ingestion Endpoint
router.all('/traffic', trafficHandler)

// Health Endpoint with database connectivity diagnostic
router.get('/health', async (req, res) => {
  const { client } = await connectToDatabase()
  const isMongoConnected = Boolean(client)
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'mongodb-connected' : 'in-memory-fallback',
    service: 'sentinel-api',
    timestamp: new Date()
  })
})

// Support both /api/* and /* paths seamlessly
app.use('/api', router)
app.use('/', router)

export default app
