import Board from './components/Board'
import ScoreBoard from './components/ScoreBoard'
import StartScreen from './components/StartScreen'
import GameOverScreen from './components/GameOverScreen'
import { useSnakeGame } from './hooks/useSnakeGame'
import { useAuth } from './context/AuthContext'
import { useScores } from './hooks/useScores'
import { useCallback, useEffect } from 'react'

export default function App() {
  const { isAuthenticated } = useAuth()
  const {
    leaderboard,
    personalBest,
    isSavingScore,
    scoreSaved,
    saveScore,
    fetchLeaderboard,
  } = useScores()

  // ── GAME OVER CALLBACK ───────────────────────────────────
  // Passed into useSnakeGame — called automatically on game over.
  // useCallback prevents it from being recreated on every render,
  // which would cause useSnakeGame's useEffect to fire unnecessarily.
  const handleGameOver = useCallback(async (score: number, timeSeconds: number) => {
    if (isAuthenticated) {
      await saveScore(score, timeSeconds)
    }
  }, [isAuthenticated, saveScore])

  const {
    state,
    dispatch,
    highScore,
    startGame,
    restartGame,
    elapsedSeconds,
    updateHighScoreFromDB,
  } = useSnakeGame(handleGameOver)

  // ── SYNC DB PERSONAL BEST → LOCAL HIGH SCORE ────────────
  // When personalBest loads from DB (after login or on mount),
  // update the local highScore state so the scoreboard reflects it.
  useEffect(() => {
    if (personalBest?.score) {
      updateHighScoreFromDB(personalBest.score)
    }
  }, [personalBest, updateHighScoreFromDB])

  // ── FETCH LEADERBOARD ON MOUNT ───────────────────────────
  // Load leaderboard as soon as the app starts so it's ready
  // when the user opens the start screen.
  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return (
    <div className="h-screen w-screen bg-zinc-900 flex flex-col overflow-hidden p-4 relative">

      <ScoreBoard
        score={state.score}
        highScore={highScore}
        elapsedSeconds={elapsedSeconds}
      />

      <Board
        state={state}
        dispatch={dispatch}
        onPause={() => dispatch({ type: 'TOGGLE_PAUSE' })}
      />

      {state.status === 'idle' && (
        <StartScreen
          highScore={highScore}
          leaderboard={leaderboard}
          onStart={startGame}
        />
      )}

      {state.status === 'gameover' && (
        <GameOverScreen
          score={state.score}
          highScore={highScore}
          timeSeconds={state.timeSeconds}
          isSavingScore={isSavingScore}
          scoreSaved={scoreSaved}
          isAuthenticated={isAuthenticated}
          onRestart={restartGame}
        />
      )}

      {state.status === 'paused' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-5xl font-black text-white mb-2">PAUSED</p>
            <p className="text-zinc-400 text-sm">Press Space to resume</p>
          </div>
        </div>
      )}
    </div>
  )
}