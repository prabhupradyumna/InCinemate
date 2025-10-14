import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { sequelize } from './db.js'
import routes from './routes/index.routes.js'
import { SERVER_CONFIG } from './constants.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// CORS with multiple allowed origins (comma-separated in ORIGIN_URLS)
const allowedOrigins = SERVER_CONFIG.CORS.ORIGINS

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
  credentials: SERVER_CONFIG.CORS.CREDENTIALS
}))

// Handle preflight for all routes
app.options('*', cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
  credentials: SERVER_CONFIG.CORS.CREDENTIALS
}))

app.use(express.json())
app.use(cookieParser())

// Simple middleware to provide models without timeout issues
app.use(async (req, res, next) => {
  try {
    req.db = sequelize
    
    // Always ensure models are properly initialized with associations
    const { getModelManager } = await import('./models/index.js')
    const modelManager = getModelManager(sequelize)
    const models = await modelManager.initialize()
    
    // Resolve tenant ID using the tenant resolver
    const { createTenantResolver } = await import('./tenant-resolver.js')
    const tenantResolver = createTenantResolver({ strategy: 'host' })
    req.tenantId = await tenantResolver(req)
    
    req.models = models
    next()
  } catch (error) {
    console.error('[App] Model initialization error:', error)
    next(error)
  }
})

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API Routes
app.use('/api', routes)

export default app
