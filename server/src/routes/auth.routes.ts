import { Router } from 'express'
import passport from '../config/passport'
import { authController } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

// ── STEP 1: Initiate Google Login ─────────────────────────
// User hits this URL → Passport redirects them to Google.
// 'scope' tells Google what info we want access to.
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,   // we use JWTs, not sessions
  })
)

// ── STEP 2: Google Callback ───────────────────────────────
// Google redirects here after user logs in.
// Passport runs the GoogleStrategy verify function,
// then calls our controller.
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  authController.googleCallback
)

// ── PROTECTED: Get Current User ───────────────────────────
// requireAuth runs first — verifies the JWT.
// If valid, calls getMe. If invalid, sends 401.
router.get('/me', requireAuth, authController.getMe)

// ── LOGOUT ────────────────────────────────────────────────
router.post('/logout', authController.logout)

export default router