import { ObjectId } from 'mongodb'
import { getCollection } from '../_lib/mongodb.js'
import { authenticateRequest } from '../_lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../_lib/response.js'

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')

  // Explicitly disable any caching by browser or Vercel edge proxy
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')

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

  let website = null
  const cleanSiteId = (websiteId && websiteId !== 'undefined' && websiteId !== 'null') ? String(websiteId).trim() : null

  if (cleanSiteId) {
    if (ObjectId.isValid(cleanSiteId)) {
      website = await websitesCollection.findOne({
        _id: new ObjectId(cleanSiteId),
        userId: user.userId,
      })
    }
    if (!website) {
      website = await websitesCollection.findOne({
        _id: cleanSiteId,
        userId: user.userId,
      })
    }
  }

  if (!website) {
    website = await websitesCollection.findOne({ userId: user.userId })
  }

  if (!website) {
    return res.status(200).json(successResponse({
      stats: null,
      message: 'No website registered yet.',
    }))
  }

  const siteIdStr = website._id.toString()
  const siteIdQueries = [website._id]
  if (ObjectId.isValid(siteIdStr)) {
    siteIdQueries.push(new ObjectId(siteIdStr))
  }
  siteIdQueries.push(siteIdStr)

  const siteFilter = { websiteId: { $in: siteIdQueries } }

  // 1. Live visits in the last 5 minutes — count UNIQUE IPs, not raw hits
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const liveIps = await visitsCollection.distinct('ip', {
    ...siteFilter,
    timestamp: { $gte: fiveMinutesAgo },
  })
  const liveVisits = liveIps.length

  // 2. Total visits - count from visits collection AND website document for 100% real-time accuracy
  const totalVisitsCount = await visitsCollection.countDocuments(siteFilter)
  const totalVisits = Math.max(website.totalVisits || 0, totalVisitsCount)

  // 3. Recent visits
  const recentVisits = await visitsCollection
    .find(siteFilter)
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
      totalVisits,
      recentVisits,
    },
  }))
}

export default withErrorHandling(handler)
