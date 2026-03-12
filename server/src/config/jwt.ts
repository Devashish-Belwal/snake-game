import jwt from 'jsonwebtoken'
import { env } from './env'

// How long until the token expires.
// 7 days — user stays logged in for a week without re-authenticating.
const JWT_EXPIRES_IN = '7d'

// The shape of data we store inside the JWT.
// Keep this minimal — JWTs are sent with every request.
export interface JWTPayload {
  userId: string
  email:  string
  name:   string
  avatar: string
}

// ── SIGN ──────────────────────────────────────────────────
// Creates a signed JWT string.
// 'signed' means: tamper-evident. If anyone modifies the token,
// verification will fail. Your JWT_SECRET is what makes it secure —
// never expose it, never commit it.
export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// ── VERIFY ────────────────────────────────────────────────
// Decodes and verifies a JWT string.
// Returns the payload if valid, null if tampered or expired.
// Used in auth middleware (Phase 10).
export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload
  } catch {
    // jwt.verify throws on invalid/expired tokens — we catch and return null.
    // The middleware will then send a 401.
    return null
  }
}