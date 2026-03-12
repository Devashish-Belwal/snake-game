// Replaces your #game-over-screen modal-content div.

type GameOverScreenProps = {
  score: number
  highScore: number
  timeSeconds: number
  isSavingScore: boolean    // ← new
  scoreSaved: boolean       // ← new
  isAuthenticated: boolean  // ← new
  onRestart: () => void
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function GameOverScreen({ score, highScore, timeSeconds, isSavingScore, scoreSaved, isAuthenticated, onRestart }: GameOverScreenProps) {
  const isNewHighScore = score >= highScore && score > 0

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-8 w-[90%] max-w-sm text-center shadow-2xl">

        {/* Crash decoration */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-4 h-4 rounded-sm bg-orange-500" />
          <div className="w-4 h-4 rounded-sm bg-orange-500" />
          <div className="w-4 h-4 rounded-sm bg-orange-500 flex items-center justify-center text-white text-[8px] font-black">✖</div>
        </div>

        <h1 className="text-4xl font-black text-orange-500 tracking-tight">GAME OVER</h1>
        <p className="text-zinc-500 text-sm mt-1 mb-6">Oops! You crashed.</p>

        {/* New High Score */}
        {isNewHighScore && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-2 mb-4 text-yellow-400 text-sm font-bold animate-pulse">
            🎉 New High Score!
          </div>
        )}

        {/* Score card */}
        <div className="bg-white/5 border border-zinc-700 rounded-xl p-4 mb-4">
          <p className="text-[10px] uppercase tracking-[3px] text-zinc-500 mb-1">Final Score</p>
          <p className="text-6xl font-black text-white leading-none">{score}</p>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white/3 border border-zinc-700 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Best</p>
            <p className="text-yellow-400 font-black">🏆 {highScore}</p>
          </div>
          <div className="flex-1 bg-white/3 border border-zinc-700 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Time</p>
            <p className="text-white font-black">{formatTime(timeSeconds)}</p>
          </div>
        </div>

        {/* ── SCORE SAVE STATUS ─────────────────────── */}
        {/* Show different states depending on auth + save status */}
        <div className="mb-5 text-xs">
          {!isAuthenticated && (
            <p className="text-zinc-500">
              Sign in to save your score to the leaderboard
            </p>
          )}
          {isAuthenticated && isSavingScore && (
            <p className="text-purple-400 animate-pulse">
              💾 Saving score...
            </p>
          )}
          {isAuthenticated && scoreSaved && !isSavingScore && (
            <p className="text-green-400">
              ✓ Score saved to leaderboard!
            </p>
          )}
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-4 bg-purple-500 hover:bg-purple-400 text-white font-black text-lg rounded-xl uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-1 shadow-[0_5px_0_rgb(100,80,180)] hover:shadow-[0_7px_0_rgb(100,80,180)] active:shadow-none"
        >
          Play Again ↻
        </button>
      </div>
    </div>
  )
}