import { useEffect, useRef, useCallback, useState } from 'react'
import { useGameReducer } from './useGameReducer'
import type { Direction } from '../types'


// Add this type at the top
type OnGameOverCallback = (score: number, timeSeconds: number) => void

// The hook returns everything App.tsx needs — state to render,
// and handlers to wire up to buttons.
// App.tsx never imports dispatch directly — it only calls these handlers.
export function useSnakeGame(onGameOver?: OnGameOverCallback) {
    const { state, dispatch } = useGameReducer()

    // useRef to track elapsed seconds — we use a ref, NOT state, for the timer.
    // Why? Because updating state every second would trigger a full re-render
    // of the entire game board every second. A ref updates silently.
    // We only push the value into real state when the game ends.
    const secondsRef = useRef(0)
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── HIGH SCORE ─────────────────────────────────────────
    // useState for highScore because we DO want a re-render when it updates
    // (the scoreboard needs to visually update).
    // localStorage persists it across sessions — replaced by DB in Phase 13.
    const [highScore, setHighScore] = useState<number>(() => {
        return Number(localStorage.getItem('highScore') ?? 0)
    })

    // ── WATCH FOR GAME OVER → CALL CALLBACK ─────────────────
    // When status becomes 'gameover', fire the callback with
    // final score and time. The callback is provided by App.tsx
    // and will call saveScore() from useScores.
    useEffect(() => {
        if (state.status === 'gameover' && state.timeSeconds > 0) {
            onGameOver?.(state.score, state.timeSeconds)
        }
    }, [state.status, state.timeSeconds, state.score, onGameOver])

    // Watch score — update highScore if beaten
    useEffect(() => {
        if (state.score > highScore) {
            setHighScore(state.score)
            localStorage.setItem('highScore', String(state.score))
        }
    }, [state.score, highScore])

    // ── UPDATE HIGH SCORE FROM DB PERSONAL BEST ──────────────
    // This is called from App.tsx when personalBest loads from DB.
    // Replaces localStorage as the source of truth for logged-in users.
    const updateHighScoreFromDB = useCallback((dbHighScore: number) => {
        if (dbHighScore > highScore) {
            setHighScore(dbHighScore)
            localStorage.setItem('highScore', String(dbHighScore))
        }
    }, [highScore])

    // ── TIMER ──────────────────────────────────────────────
    // Mirrors your timerInterval from JS, but uses a ref so it
    // doesn't cause unnecessary re-renders every second.
    useEffect(() => {
        if (state.status === 'playing') {
            timerIntervalRef.current = setInterval(() => {
                secondsRef.current += 1
            }, 1000)
        }

        // Cleanup — runs when status changes (e.g. playing → gameover)
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
                timerIntervalRef.current = null
            }
        }
    }, [state.status])

    // ── CAPTURE TIME ON GAME OVER ─────────────────────────────
    // When MOVE detects a collision, it sets status to 'gameover'.
    // This effect watches for that and immediately dispatches GAME_OVER
    // with the elapsed time from our ref.
    useEffect(() => {
        if (state.status === 'gameover' && state.timeSeconds === 0 && secondsRef.current > 0) {
            dispatch({
                type: 'GAME_OVER',
                payload: { timeSeconds: secondsRef.current }
            })
        }
    }, [state.status, state.timeSeconds, dispatch])

    // ── GAME LOOP ──────────────────────────────────────────────
    // Moved directly from App.tsx — no changes needed.
    // setInterval fires MOVE every 150ms while playing.
    useEffect(() => {
        if (state.status !== 'playing') return

        const interval = setInterval(() => {
            dispatch({ type: 'MOVE' })
        }, 150)

        return () => clearInterval(interval)
    }, [state.status, dispatch])

    // ── KEYBOARD HANDLER ──────────────────────────────────────
    // Moved directly from App.tsx — no changes needed.
    useEffect(() => {
        const keyMap: Record<string, Direction> = {
            ArrowUp: 'up', w: 'up',
            ArrowDown: 'down', s: 'down',
            ArrowLeft: 'left', a: 'left',
            ArrowRight: 'right', d: 'right',
        }

        const handleKey = (e: KeyboardEvent) => {
            // Pause toggle
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault()
                dispatch({ type: 'TOGGLE_PAUSE' })
                return
            }

            // Prevent arrow keys from scrolling the page while playing
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault()
            }
            const dir = keyMap[e.key]
            if (dir) dispatch({ type: 'CHANGE_DIRECTION', payload: dir })
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [dispatch])

    // ── HANDLERS ──────────────────────────────────────────────
    // App.tsx calls these on button clicks.
    // useCallback prevents these functions from being recreated
    // on every render — important for performance when passed as props.

    const startGame = useCallback(() => {
        secondsRef.current = 0   // reset timer on start
        dispatch({ type: 'START_GAME' })
    }, [dispatch])

    const restartGame = useCallback(() => {
        secondsRef.current = 0   // reset timer on restart
        dispatch({ type: 'RESTART_GAME' })
    }, [dispatch])

    // ── EXPOSE ────────────────────────────────────────────────
    // This is the hook's "public API" — the only things
    // App.tsx is allowed to know about.
    return {
        state,
        dispatch,
        highScore,
        startGame,
        restartGame,
        elapsedSeconds: secondsRef.current,
        updateHighScoreFromDB,
    }
}