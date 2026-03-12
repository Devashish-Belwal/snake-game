import type { LeaderboardEntry } from '../types'
import { useAuth } from '../context/AuthContext'

// Replaces your #start-screen modal-content div.
// Mirrors your original design: snake decor, high score, controls, objectives, button.

type StartScreenProps = {
  highScore: number
  leaderboard: LeaderboardEntry[]
  onStart: () => void
}

export default function StartScreen({ highScore, leaderboard, onStart }: StartScreenProps) {
  const { isAuthenticated, loginWithGoogle } = useAuth()

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-8 w-[90%] max-w-sm text-center shadow-2xl">

        {/* Snake decoration */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-4 h-4 rounded-sm bg-purple-400" />
          <div className="w-4 h-4 rounded-sm bg-purple-400" />
          <div className="w-4 h-4 rounded-sm bg-purple-200" />
        </div>

        <h1 className="text-5xl font-black text-purple-400 tracking-tight mb-4">
          SNAKE
        </h1>

        {/* High Score badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-zinc-600 rounded-full px-4 py-2 text-sm mb-6">
          <span>🏆 High Score:</span>
          <span className="text-green-400 font-bold">{highScore}</span>
        </div>

        {/* Controls */}
        <div className="mb-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Controls</p>
          <div className="flex justify-center items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="flex"><Key label="W" /></div>
              <div className="flex gap-1">
                <Key label="A" /><Key label="S" /><Key label="D" />
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-500">OR</span>
            <div className="flex flex-col items-center gap-1">
              <div className="flex"><Key label="↑" /></div>
              <div className="flex gap-1">
                <Key label="←" /><Key label="↓" /><Key label="→" />
              </div>
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-white/3 border border-zinc-700 rounded-xl p-3 flex items-center gap-3 text-left">
            <div className="w-5 h-5 rounded-md bg-orange-500 shrink-0 animate-pulse" />
            <div>
              <p className="text-green-400 font-black text-xs">EAT</p>
              <p className="text-zinc-500 text-[10px]">+10 Points</p>
            </div>
          </div>
          <div className="flex-1 bg-white/3 border border-zinc-700 rounded-xl p-3 flex items-center gap-3 text-left">
            <div className="w-5 h-5 rounded-md bg-purple-400 border-2 border-zinc-600 shrink-0" />
            <div>
              <p className="text-orange-400 font-black text-xs">AVOID</p>
              <p className="text-zinc-500 text-[10px]">Walls / Tail</p>
            </div>
          </div>
        </div>

        {/* ── LEADERBOARD ───────────────────────────── */}
        {leaderboard.length > 0 && (
          <div className="mb-5 text-left">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2 text-center">
              🏆 Leaderboard
            </p>
            <div className="bg-black/20 rounded-xl overflow-hidden">
              {leaderboard.slice(0, 5).map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-3 px-3 py-2 border-b border-zinc-700/50 last:border-0"
                >
                  {/* Rank — gold for #1 */}
                  <span className={`text-xs font-black w-4 text-center
                    ${entry.rank === 1 ? 'text-yellow-400' : 'text-zinc-500'}`}
                  >
                    {entry.rank}
                  </span>

                  {/* Avatar */}
                  <img
                    src={entry.userAvatar || '/default-avatar.png'}
                    alt={entry.userName}
                    className="w-5 h-5 rounded-full shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />

                  {/* Name */}
                  <span className="text-xs text-zinc-300 flex-1 truncate">
                    {entry.userName}
                  </span>

                  {/* Score */}
                  <span className="text-xs font-black text-white">
                    {entry.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login prompt for guests */}
        {!isAuthenticated && (
          <p className="text-xs text-zinc-500 mb-3">
            <button
              onClick={loginWithGoogle}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Sign in
            </button>
            {' '}to save your scores to the leaderboard
          </p>
        )}

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full py-4 bg-orange-500 hover:bg-green-400 text-black font-black text-lg rounded-xl uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-1 shadow-[0_5px_0_rgb(160,50,20)] hover:shadow-[0_7px_0_rgb(100,140,40)] active:shadow-none"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}

// Small reusable Key component — only used here
function Key({ label }: { label: string }) {
  return (
    <div className="w-8 h-8 bg-zinc-900 border border-zinc-600 border-b-[3px] rounded-md flex items-center justify-center text-xs font-bold text-white">
      {label}
    </div>
  )
}