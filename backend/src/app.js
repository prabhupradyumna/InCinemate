import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { attachTenantDb } from './middleware/tenant-db.js'
import routes from './routes/index.routes.js'
import { SERVER_CONFIG } from './constants.js'

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
app.use(attachTenantDb())

// API Routes
app.use('/api', routes)

export default app
