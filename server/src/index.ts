import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env'
import { connectDatabase } from './config/database'
import passport from './config/passport'
import { requireAuth } from './middleware/auth.middleware'

const app = express()

// ── GLOBAL MIDDLEWARE ──────────────────────────────────────
// These run on EVERY request, before any route handler.

// helmet adds security headers automatically
app.use(helmet())

// cors allows requests from our React frontend
// Without this, the browser blocks cross-origin requests

const allowedOrigins = [
  env.CLIENT_URL,                        // from .env — covers both dev and prod
  'http://localhost:5173',               // always allow local dev
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked: ${origin} not in allowed list`))
    }
  },
  credentials: true,
}))

// Parse incoming JSON bodies — needed for POST requests
app.use(express.json())

// Initialize passport — must come after express.json()
app.use(passport.initialize())

// ── ROUTES ────────────────────────────────────────────────
// Each router handles a group of related URLs.
// We'll uncomment these as we build each phase:

import authRoutes from './routes/auth.routes'
import scoreRoutes from './routes/score.routes'

app.use('/auth', authRoutes)
app.use('/api', scoreRoutes)

// ── HEALTH CHECK ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running',
    environment: env.NODE_ENV,
  })
})

// ── 404 HANDLER ───────────────────────────────────────────
// Catches any request that didn't match a route above.
// Must come AFTER all routes.
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

// ── START ──────────────────────────────────────────────────
async function bootstrap() {
  await connectDatabase()
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
  })
}

bootstrap()