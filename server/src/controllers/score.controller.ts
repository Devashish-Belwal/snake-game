import type { Request, Response } from 'express'
import { Score } from '../models/Score.model'
import { getAuthUser } from '../middleware/auth.middleware'

export const scoreController = {

  // ── POST /api/scores ────────────────────────────────────
  // Saves a completed game's score to the database.
  // requireAuth runs before this — req.user is guaranteed to exist.
  create: async (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req)

      // Destructure and validate the request body
      const { score, timeSeconds } = req.body

      if (typeof score !== 'number' || typeof timeSeconds !== 'number') {
        res.status(400).json({
          success: false,
          error: 'score and timeSeconds must be numbers',
        })
        return
      }

      if (score < 0 || timeSeconds < 0) {
        res.status(400).json({
          success: false,
          error: 'score and timeSeconds must be non-negative',
        })
        return
      }

      // Create the score document.
      // userId comes from the verified JWT — not from req.body.
      // This is critical: never trust the client to send their own userId.
      // If you did, anyone could post scores on behalf of other users.
      const newScore = await Score.create({
        userId:      user.userId,
        userName:    user.name,
        userAvatar:  user.avatar,
        score,
        timeSeconds,
      })

      res.status(201).json({
        success: true,
        data: newScore,
      })

    } catch (error) {
      console.error('Error saving score:', error)
      res.status(500).json({ success: false, error: 'Failed to save score' })
    }
  },

  // ── GET /api/leaderboard ─────────────────────────────────
  // Returns top 10 scores globally, sorted by score descending.
  // Public — no auth required.
  leaderboard: async (req: Request, res: Response) => {
    try {
      const topScores = await Score
        .find()                          // no filter — all users
        .sort({ score: -1, playedAt: -1 }) // highest score first, then most recent
        .limit(10)                       // only top 10
        .select('userName userAvatar score timeSeconds playedAt') // only needed fields
        .lean()                          // returns plain JS objects, not Mongoose docs
                                         // lean() is faster — skips Mongoose overhead
                                         // use it whenever you're only reading data

      // Add rank to each entry (1-based)
      const ranked = topScores.map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }))

      res.json({ success: true, data: ranked })

    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' })
    }
  },

  // ── GET /api/scores/me ───────────────────────────────────
  // Returns the logged-in user's personal best + last 10 games.
  // Protected — must be logged in.
  myBest: async (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req)

      // Run both queries in parallel — no reason to wait for one before starting the other.
      // Promise.all fires both simultaneously and waits for both to finish.
      // Sequential would take 2x as long.
      const [personalBest, recentGames] = await Promise.all([

        Score
          .findOne({ userId: user.userId })
          .sort({ score: -1 })           // highest score this user ever got
          .select('score timeSeconds playedAt')
          .lean(),

        Score
          .find({ userId: user.userId })
          .sort({ playedAt: -1 })        // most recent games first
          .limit(10)
          .select('score timeSeconds playedAt')
          .lean(),
      ])

      res.json({
        success: true,
        data: {
          personalBest: personalBest ?? null,  // null if user has never played
          recentGames,
        },
      })

    } catch (error) {
      console.error('Error fetching user scores:', error)
      res.status(500).json({ success: false, error: 'Failed to fetch scores' })
    }
  },
}