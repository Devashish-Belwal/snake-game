// This file loads and validates environment variables at startup.
// If a required variable is missing, the server crashes immediately
// with a clear message — better than a cryptic error later at runtime.

import dotenv from 'dotenv'
dotenv.config()

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: requireEnv('MONGODB_URI'),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  JWT_SECRET: requireEnv('JWT_SECRET'),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CALLBACK_URL: process.env.CALLBACK_URL || 'http://localhost:5000/auth/google/callback',
}