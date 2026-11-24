import { getCollection } from '../_lib/mongodb.js'
import { successResponse, errorResponse, withErrorHandling } from '../_lib/response.js'

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('Method not allowed. Use POST.', 405))
  }

  let apiKey = req.headers['x-api-key']
  if (!apiKey && req.headers.authorization?.startsWith('Bearer ')) {
    apiKey = req.headers.authorization.slice(7)
  }
  if (!apiKey && req.body?.apiKey) {
    apiKey = req.body.apiKey
  }

  const cleanKey = typeof apiKey === 'string' ? apiKey.trim() : ''

  if (!cleanKey) {
    console.warn('[Sentinel Traffic] Rejected: Missing API key.')
    return res.status(401).json(errorResponse('API key is required. Pass in x-api-key header or body.', 401))
  }

  if (cleanKey === 'sent_live_demo87654321abcdef0123456789') {
    return res.status(200).json(successResponse({
      recorded: true,
      site: 'store.sentinel-security.dev',
      message: 'Demo traffic visit acknowledged.',
    }))
  }

  const websitesCollection = await getCollection('websites')
  const visitsCollection = await getCollection('visits')

  const website = await websitesCollection.findOne({ apiKey: cleanKey })
  if (!website) {
    console.warn(`[Sentinel Traffic] ❌ Rejected: No website found in database matching API key: "${cleanKey}"`)
    return res.status(404).json(errorResponse('Invalid API key. No matching registered website found.', 404))
  }

  const body = req.body || {}
  const path = typeof body.path === 'string' ? body.path.slice(0, 500) : '/'
  const method = typeof body.method === 'string' ? body.method.toUpperCase().slice(0, 10) : 'GET'
  const ip = body.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1'
  const userAgent = body.userAgent || req.headers['user-agent'] || 'Unknown'
  const timestamp = new Date()

  // Deduplicate live-visitor tracking: only insert a new visit document
  // if this IP hasn't been seen in the last 5 minutes (prevents refresh spam on liveVisits).
  // totalVisits always increments regardless so every request is counted.
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const recentVisit = await visitsCollection.findOne({
    websiteId: website._id,
    ip,
    timestamp: { $gte: fiveMinutesAgo },
  })

  if (!recentVisit) {
    await visitsCollection.insertOne({
      websiteId: website._id,
      path,
      method,
      ip,
      userAgent,
      timestamp,
    })
  }

  await websitesCollection.updateOne(
    { _id: website._id },
    { $inc: { totalVisits: 1 }, $set: { updatedAt: timestamp } }
  )

  console.log(`[Sentinel Traffic] ✅ Recorded visit for "${website.name}" (${website.domain}) - Path: ${path}`)

  return res.status(200).json(successResponse({
    recorded: true,
    site: website.domain,
    timestamp,
  }))
}

export default withErrorHandling(handler)
