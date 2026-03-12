// Replaces your .infos div in the HTML.
// Receives values as props — it only displays, never computes.

import LoginButton from "./LoginButton"

type ScoreBoardProps = {
  score: number
  highScore: number
  elapsedSeconds: number
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function ScoreBoard({ score, highScore, elapsedSeconds }: ScoreBoardProps) {
  return (
    <div className="flex justify-between items-center mb-4 px-2">
      
      {/* Game Title */}
      <h1 className="text-2xl font-black text-purple-400 tracking-tight">
        Snake <span className="text-orange-500">Game</span>
      </h1>

      {/* Stats — mirrors your three .info divs */}
      <div className="flex gap-6 text-sm font-semibold">
        <div className="text-zinc-400">
          High Score:{' '}
          <span className="text-yellow-400 font-bold">{highScore}</span>
        </div>
        <div className="text-zinc-400">
          Score:{' '}
          <span className="text-white font-bold">{score}</span>
        </div>
        <div className="text-zinc-400">
          Time:{' '}
          <span className="text-white font-bold">{formatTime(elapsedSeconds)}</span>
        </div>

        {/* Login button — reads auth state internally via useAuth() */}
        <LoginButton />
      </div>
    </div>
  )
}