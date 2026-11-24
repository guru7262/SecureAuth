import { ObjectId } from 'mongodb'
import { getCollection } from '../_lib/mongodb.js'
import { authenticateRequest } from '../_lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../_lib/response.js'

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json(errorResponse('Method not allowed', 405))
  }

  const user = await authenticateRequest(req)
  if (!user) {
    return res.status(401).json(errorResponse('Unauthorized. Please log in.', 401))
  }

  const { websiteId } = req.query || {}

  // Demo User Stats
  if (user.isDemo || user.userId === 'demo-user-id') {
    return res.status(200).json(successResponse({
      stats: {
        websiteId: websiteId || 'demo-site-1',
        name: 'Sentinel Demo Store',
        domain: 'store.sentinel-security.dev',
        apiKey: 'sent_live_demo87654321abcdef0123456789',
        liveVisits: 42,
        totalVisits: 154782,
        recentVisits: [
          { path: '/api/auth/login', method: 'POST', ip: '185.220.101.42', timestamp: new Date(Date.now() - 30 * 1000) },
          { path: '/products', method: 'GET', ip: '45.136.22.18', timestamp: new Date(Date.now() - 75 * 1000) },
          { path: '/checkout', method: 'POST', ip: '103.78.54.91', timestamp: new Date(Date.now() - 120 * 1000) },
          { path: '/', method: 'GET', ip: '91.240.118.12', timestamp: new Date(Date.now() - 190 * 1000) },
          { path: '/pricing', method: 'GET', ip: '194.26.29.112', timestamp: new Date(Date.now() - 250 * 1000) },
        ],
      },
    }))
  }

  const websitesCollection = await getCollection('websites')
  const visitsCollection = await getCollection('visits')

  let website
  if (websiteId) {
    try {
      website = await websitesCollection.findOne({
        _id: ObjectId.isValid(websiteId) ? new ObjectId(websiteId) : websiteId,
        userId: user.userId,
      })
    } catch {
      website = await websitesCollection.findOne({ _id: websiteId, userId: user.userId })
    }
  } else {
    website = await websitesCollection.findOne({ userId: user.userId })
  }

  if (!website) {
    return res.status(200).json(successResponse({
      stats: null,
      message: 'No website registered yet.',
    }))
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const liveVisits = await visitsCollection.countDocuments({
    websiteId: website._id,
    timestamp: { $gte: fiveMinutesAgo },
  })

  const recentVisits = await visitsCollection
    .find({ websiteId: website._id })
    .sort({ timestamp: -1 })
    .limit(15)
    .toArray()

  return res.status(200).json(successResponse({
    stats: {
      websiteId: website._id,
      name: website.name,
      domain: website.domain,
      apiKey: website.apiKey,
      liveVisits,
      totalVisits: website.totalVisits || 0,
      recentVisits,
    },
  }))
}

export default withErrorHandling(handler)
