import { useRef, useEffect } from 'react'
import type { GameState } from '../types'
import type { Dispatch } from 'react'
import type { GameAction } from '../types'
import Cell from './Cell'

type BoardProps = {
    state: GameState
    dispatch: Dispatch<GameAction>
    onPause?: () => void    // ← add this
}

// How many pixels per cell — mirrors your blockWidth/blockHeight from JS
const CELL_SIZE = 28 // px

export default function Board({ state, dispatch, onPause }: BoardProps) {
    const { snake, food, rows, cols } = state
    const boardRef = useRef<HTMLDivElement>(null)

    // ── Measure board, compute grid dimensions, tell the reducer ──
    // This replaces your setupBoard() function.
    // useEffect runs AFTER the div is rendered and mounted to the DOM,
    // so boardRef.current is guaranteed to exist and have real dimensions.
    useEffect(() => {
        const el = boardRef.current
        if (!el) return

        const computedRows = Math.floor(el.clientHeight / CELL_SIZE)
        const computedCols = Math.floor(el.clientWidth / CELL_SIZE)

        dispatch({
            type: 'SET_BOARD_SIZE',
            payload: { rows: computedRows, cols: computedCols }
        })

        // Handle resize — mirrors your window.addEventListener("resize", ...)
        // But instead of reloading the page, we just recompute and dispatch.
        const handleResize = () => {
            const newRows = Math.floor(el.clientHeight / CELL_SIZE)
            const newCols = Math.floor(el.clientWidth / CELL_SIZE)
            dispatch({
                type: 'SET_BOARD_SIZE',
                payload: { rows: newRows, cols: newCols }
            })
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)

        // Empty dependency array = run once on mount, cleanup on unmount.
        // This is the React equivalent of window.addEventListener("load", ...)
    }, [])

    // ── Determine cell type — replaces your render() loop ──
    // For each (row, col) position, figure out what lives there.
    // This runs on every render (every time state changes).
    function getCellType(r: number, c: number) {
        if (snake[0]?.x === r && snake[0]?.y === c) return 'head'
        if (snake.some(s => s.x === r && s.y === c)) return 'snake'
        if (food.x === r && food.y === c) return 'food'
        return 'empty'
    }

    return (
        <div
            ref={boardRef}
            onClick={onPause}
            className="w-full flex-1 min-h-0 cursor-pointer"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
                // Center the grid within the board div
                justifyContent: 'center',
                alignContent: 'center',
                gap: '1px',
            }}
        >
            {/* 
        Generate rows × cols cells.
        In your JS: nested for loop creating div elements.
        In React: Array.from to produce JSX elements.
        
        The key prop is critical — React uses it to track which 
        cell is which across re-renders. Row-col combo is unique.
      */}
            {rows > 0 && cols > 0 && Array.from({ length: rows }, (_, r) =>
                Array.from({ length: cols }, (_, c) => (
                    <Cell
                        key={`${r}-${c}`}
                        type={getCellType(r, c)}
                    />
                ))
            )}
        </div>
    )
}