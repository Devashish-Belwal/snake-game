import { useState, useEffect, useCallback } from 'react'
import { scoresApi } from '../api/scores.api'
import { useAuth } from '../context/AuthContext'
import type { LeaderboardEntry, Score } from '../types'

export function useScores() {
  const { isAuthenticated } = useAuth()

  // ── STATE ────────────────────────────────────────────────
  const [leaderboard, setLeaderboard]       = useState<LeaderboardEntry[]>([])
  const [personalBest, setPersonalBest]     = useState<Score | null>(null)
  const [isSavingScore, setIsSavingScore]   = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [scoreSaved, setScoreSaved]         = useState(false)  // feedback flag

  // ── FETCH LEADERBOARD ────────────────────────────────────
  // Public — called on start screen mount regardless of auth.
  const fetchLeaderboard = useCallback(async () => {
    setIsFetchingData(true)
    const result = await scoresApi.getLeaderboard()
    if (result.success && result.data) {
      setLeaderboard(result.data)
    }
    setIsFetchingData(false)
  }, [])

  // ── FETCH PERSONAL BEST ──────────────────────────────────
  // Only runs if logged in — gives us the DB personal best
  // to use instead of localStorage.
  const fetchPersonalBest = useCallback(async () => {
    if (!isAuthenticated) return
    const result = await scoresApi.getMyScores()
    if (result.success && result.data?.personalBest) {
      setPersonalBest(result.data.personalBest)
    }
  }, [isAuthenticated])

  // ── SAVE SCORE ───────────────────────────────────────────
  // Called automatically on game over if user is logged in.
  // Returns the saved score so the caller can update highScore.
  const saveScore = useCallback(async (score: number, timeSeconds: number) => {
    if (!isAuthenticated) return null   // silently skip if not logged in

    setIsSavingScore(true)
    setScoreSaved(false)

    const result = await scoresApi.saveScore({ score, timeSeconds })

    setIsSavingScore(false)

    if (result.success && result.data) {
      setScoreSaved(true)

      // Refresh leaderboard + personal best after saving
      // so the UI reflects the new score immediately.
      // Run both in parallel — no reason to wait for one first.
      await Promise.all([fetchLeaderboard(), fetchPersonalBest()])

      return result.data
    }

    return null
  }, [isAuthenticated, fetchLeaderboard, fetchPersonalBest])

  // ── AUTO-FETCH ON AUTH CHANGE ────────────────────────────
  // When a user logs in mid-session, immediately fetch their
  // personal best so highScore updates without a page refresh.
  useEffect(() => {
    fetchPersonalBest()
  }, [fetchPersonalBest])

  return {
    leaderboard,
    personalBest,
    isSavingScore,
    isFetchingData,
    scoreSaved,
    saveScore,
    fetchLeaderboard,
  }
}