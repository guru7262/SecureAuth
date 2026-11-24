import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { getCollection } from '../lib/mongodb.js'
import { authenticateRequest } from '../lib/auth.js'
import { successResponse, errorResponse, withErrorHandling } from '../lib/response.js'

async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const user = await authenticateRequest(req)
  if (!user) {
    return res.status(401).json(errorResponse('Unauthorized. Please log in.', 401))
  }

  const websitesCollection = await getCollection('websites')

  // ───── GET: List Websites ─────
  if (req.method === 'GET') {
    if (user.isDemo || user.userId === 'demo-user-id') {
      const demoSites = [
        {
          _id: 'demo-site-1',
          name: 'Sentinel Demo Store',
          domain: 'store.sentinel-security.dev',
          apiKey: 'sent_live_demo87654321abcdef0123456789',
          totalVisits: 154782,
          liveVisits: 42,
          createdAt: new Date('2026-11-20T10:00:00.000Z'),
        },
      ]
      return res.status(200).json(successResponse({ websites: demoSites }))
    }

    const sites = await websitesCollection.find({ userId: user.userId }).sort({ createdAt: -1 }).toArray()
    return res.status(200).json(successResponse({ websites: sites }))
  }

  // ───── POST: Register New Website ─────
  if (req.method === 'POST') {
    const { name, domain } = req.body || {}

    if (!domain || typeof domain !== 'string' || domain.trim().length < 3) {
      return res.status(400).json(errorResponse('A valid domain is required (e.g. example.com)', 400))
    }

    const cleanedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    const siteName = name?.trim() || cleanedDomain

    // If demo user registers a site, return an ephemeral site
    if (user.isDemo || user.userId === 'demo-user-id') {
      const demoKey = `sent_live_${crypto.randomBytes(16).toString('hex')}`
      const demoSite = {
        _id: `demo-${Date.now()}`,
        userId: user.userId,
        name: siteName,
        domain: cleanedDomain,
        apiKey: demoKey,
        totalVisits: 0,
        createdAt: new Date(),
      }
      return res.status(201).json(successResponse({ website: demoSite }, 201))
    }

    // Generate unique API key for this website
    const apiKey = `sent_live_${crypto.randomBytes(16).toString('hex')}`

    const websiteDoc = {
      userId: user.userId,
      name: siteName,
      domain: cleanedDomain,
      apiKey,
      totalVisits: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await websitesCollection.insertOne(websiteDoc)
    websiteDoc._id = result.insertedId

    return res.status(201).json(successResponse({ website: websiteDoc }, 201))
  }

  return res.status(405).json(errorResponse('Method not allowed', 405))
}

export default withErrorHandling(handler)
