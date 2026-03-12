import type { Request, Response, NextFunction } from 'express'
import { verifyJWT } from '../config/jwt'
import type { JWTPayload } from '../config/jwt'

// Filled in Phase 10.
// Protects routes that require a logged-in user.

// ── requireAuth ───────────────────────────────────────────
// Protects any route it's applied to.
// Reads the JWT from the Authorization header,
// verifies it, and attaches the payload to req.user.
// If anything is wrong, sends 401 and stops the pipeline.

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // ── STEP 1: Extract the token ──────────────────────────
  // The frontend sends: Authorization: Bearer eyJhbGci...
  // This is the standard "Bearer token" format for JWTs.
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'No token provided',
    })
    return   // return without calling next() — pipeline stops here
  }

  // Split "Bearer eyJhbGci..." → grab the token part
  const token = authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Malformed token',
    })
    return
  }

  // ── STEP 2: Verify the token ───────────────────────────
  // verifyJWT returns the payload if valid, null if tampered/expired
  const payload = verifyJWT(token)

  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    })
    return
  }

  // ── STEP 3: Attach user to request ────────────────────
  // Every controller after this middleware can read req.user
  // and know exactly who is making the request.
  // This is the key value of middleware — the controller
  // never has to think about auth. It just reads req.user.
  req.user = payload

  // ── STEP 4: Pass control to the next handler ──────────
  // If we're here, the token is valid. Let the request through.
  next()
}
// ```

// ---

// ## ✅ Final Server Structure
// ```
// server/src/
// ├── index.ts                        ← ✅ updated
// ├── config/
// │   └── env.ts                      ← ✅ created
// ├── routes/
// │   ├── auth.routes.ts              ← ✅ stub
// │   └── score.routes.ts             ← ✅ stub
// ├── controllers/
// │   ├── auth.controller.ts          ← ✅ stub
// │   └── score.controller.ts         ← ✅ stub
// ├── middleware/
// │   └── auth.middleware.ts          ← ✅ stub
// └── models/                         ← filled in Phase 8


// ── optionalAuth ──────────────────────────────────────────
// Like requireAuth but never rejects the request.
// If a valid token exists → attaches req.user.
// If no token or invalid → req.user stays undefined, request continues.
// Use on public routes that have optional personalization.

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Malformed token',
      })
      return
    }

    const payload = verifyJWT(token)
    if (payload) {
      req.user = payload
    }
  }

  // Always call next() — this middleware never blocks
  next()
}
// ```

// ---

// ## Step 3 — Understanding `req.user` Flow

// Here's the complete picture of how `req.user` travels through a protected request:
// ```
// React frontend
//   → fetch('/api/scores', {
//       headers: { Authorization: 'Bearer eyJhbGci...' }
//     })

// Express receives the request
//   → requireAuth runs
//       → reads Authorization header
//       → verifies JWT with JWT_SECRET
//       → decodes payload: { userId, email, name, avatar }
//       → sets req.user = payload
//       → calls next()

//   → scoreController.create runs
//       → reads req.user.userId        ← knows who's posting the score
//       → creates Score document in DB
//       → sends response


// ── TYPE GUARD ────────────────────────────────────────────
// Tells TypeScript: "if this returns true, req.user is a JWTPayload"
// Controllers call this to get a fully-typed user object.
export function getAuthUser(req: Request): JWTPayload {
  const user = req.user as JWTPayload
  if (!user?.userId) {
    throw new Error('requireAuth middleware not applied to this route')
  }
  return user
}