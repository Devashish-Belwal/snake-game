import type { Request, Response } from 'express'
import type { IUser } from '../models/User.model'
import { signJWT } from '../config/jwt'
import { env } from '../config/env'

export const authController = {

  // ── GOOGLE CALLBACK ───────────────────────────────────
  // Called by Passport after successful Google authentication.
  // At this point, req.user has been populated by Passport
  // with the user document from MongoDB.
  googleCallback: (req: Request, res: Response) => {
    const user = req.user as IUser

    if (!user) {
      return res.redirect(`${env.CLIENT_URL}/login?error=auth_failed`)
    }

    // Mint a JWT for this user
    const token = signJWT({
      userId: user._id.toString(),
      email:  user.email,
      name:   user.name,
      avatar: user.avatar,
    })

    // Send the token to the frontend via URL query parameter.
    // The React app will read it, store it, then clean the URL.
    // We can't use a cookie here easily because frontend and
    // backend are on different origins in development.
    res.redirect(`${env.CLIENT_URL}?token=${token}`)
  },

  // ── GET ME ────────────────────────────────────────────
  // Returns the currently logged-in user's info.
  // The requireAuth middleware (Phase 10) runs before this
  // and populates req.user from the JWT.
  getMe: (req: Request, res: Response) => {
    // req.user is set by requireAuth middleware
    res.json({ success: true, data: req.user })
  },

  // ── LOGOUT ────────────────────────────────────────────
  // JWTs are stateless — the server can't "invalidate" them.
  // Logout just tells the client to delete its copy of the token.
  // The token technically stays valid until expiry but the client
  // no longer sends it, so effectively the user is logged out.
  logout: (req: Request, res: Response) => {
    res.json({ success: true, message: 'Logged out successfully' })
  },
}