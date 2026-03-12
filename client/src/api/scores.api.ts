import { apiClient } from './client'
import type { LeaderboardEntry, Score, ScorePayload } from '../types'

export const scoresApi = {

  // POST a completed game's score
  saveScore: (payload: ScorePayload) =>
    apiClient<Score>('/api/scores', {
      method: 'POST',
      body: JSON.stringify({
      score: payload.score,
      timeSeconds: payload.timeSeconds,
    }),
    }),

  // GET top 10 global leaderboard
  getLeaderboard: () =>
    apiClient<LeaderboardEntry[]>('/api/leaderboard'),

  // GET current user's personal best + history
  getMyScores: () =>
    apiClient<{ personalBest: Score | null; recentGames: Score[] }>('/api/scores/me'),
}