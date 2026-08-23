import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'secureauth'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  const db = client.db(MONGODB_DB)

  cachedClient = client
  cachedDb = db

  return { client, db }
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