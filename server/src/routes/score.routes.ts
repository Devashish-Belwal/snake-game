import { Router } from 'express'
import { scoreController } from '../controllers/score.controller'
import { requireAuth, optionalAuth } from '../middleware/auth.middleware'

const router = Router()

// POST /api/scores — save a score (must be logged in)
router.post('/scores', requireAuth, scoreController.create)

// GET /api/leaderboard — top 10 scores (public)
// optionalAuth here means: if logged in, req.user is available
// (useful later if you want to highlight the current user's entry)
router.get('/leaderboard', optionalAuth, scoreController.leaderboard)

// GET /api/scores/me — personal best + history (must be logged in)
router.get('/scores/me', requireAuth, scoreController.myBest)

export default router