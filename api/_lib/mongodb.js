import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'secureauth'

let cachedClient = null
let cachedDb = null

// In-memory fallback store when MongoDB is unreachable (local dev / testing)
class MemoryCollection {
  constructor(name) {
    this.name = name
    this.items = []
  }

  _matches(item, query = {}) {
    for (const [k, v] of Object.entries(query)) {
      if (k === '_id' && item._id && item._id.toString() !== v.toString()) {
        return false
      }
      if (v && typeof v === 'object' && ('$gte' in v || '$gt' in v || '$lte' in v || '$lt' in v)) {
        const val = item[k]
        if (v.$gte && val < v.$gte) return false
        if (v.$gt && val <= v.$gt) return false
        if (v.$lte && val > v.$lte) return false
        if (v.$lt && val >= v.$lt) return false
        continue
      }
      if (item[k] !== v && k !== '_id') {
        return false
      }
    }
    return true
  }

  async findOne(query = {}, options = {}) {
    const item = this.items.find(i => this._matches(i, query))
    if (!item) return null
    const copy = { ...item }
    if (options.projection?.passwordHash === 0) {
      delete copy.passwordHash
    }
    return copy
  }

  find(query = {}) {
    let result = this.items.filter(i => this._matches(i, query)).map(i => ({ ...i }))
    return {
      sort: (criteria = {}) => {
        const [field, direction] = Object.entries(criteria)[0] || []
        if (field) {
          result.sort((a, b) => {
            const valA = a[field]
            const valB = b[field]
            return direction === -1 ? (valA < valB ? 1 : -1) : (valA > valB ? 1 : -1)
          })
        }
        return {
          limit: (n) => ({
            toArray: async () => result.slice(0, n)
          }),
          toArray: async () => result
        }
      },
      limit: (n) => ({
        toArray: async () => result.slice(0, n)
      }),
      toArray: async () => result
    }
  }

  async insertOne(doc) {
    const _id = doc._id || Math.random().toString(36).substring(2, 15)
    const record = { ...doc, _id }
    this.items.push(record)
    return { insertedId: _id, acknowledged: true }
  }

  async updateOne(query = {}, update = {}) {
    const item = this.items.find(i => this._matches(i, query))
    if (!item) return { matchedCount: 0, modifiedCount: 0 }

    if (update.$set) {
      Object.assign(item, update.$set)
    }
    if (update.$inc) {
      for (const [field, delta] of Object.entries(update.$inc)) {
        item[field] = (item[field] || 0) + delta
      }
    }
    return { matchedCount: 1, modifiedCount: 1 }
  }

  async countDocuments(query = {}) {
    return this.items.filter(i => this._matches(i, query)).length
  }

  async createIndex() {
    return 'index_created'
  }
}

const memoryDb = {
  collections: new Map(),
  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MemoryCollection(name))
    }
    return this.collections.get(name)
  }
}

let useMemoryFallback = false

export async function connectToDatabase() {
  if (useMemoryFallback) {
    return { client: null, db: memoryDb }
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  if (!MONGODB_URI) {
    console.warn('[MongoDB] No MONGODB_URI set. Using in-memory fallback.')
    useMemoryFallback = true
    return { client: null, db: memoryDb }
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 2000,
      socketTimeoutMS: 15000,
    })

    const db = client.db(MONGODB_DB)
    cachedClient = client
    cachedDb = db
    return { client, db }
  } catch (err) {
    console.warn(`[MongoDB] Connection failed (${err.message}). Using resilient in-memory store.`)
    useMemoryFallback = true
    return { client: null, db: memoryDb }
  }
}

export async function getCollection(name) {
  const { db } = await connectToDatabase()
  return db.collection(name)
}

export function closeConnection() {
  if (cachedClient) {
    cachedClient.close()
    cachedClient = null
    cachedDb = null
  }
}