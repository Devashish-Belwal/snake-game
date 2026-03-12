import type { GameState, GameAction, Position } from '../types'
import { useReducer } from 'react'

// ─── HELPERS ──────────────────────────────────────────────

// Mirrors your resetSnake() function — but pure, no side effects.
// "Pure" means: given the same input, always returns the same output.
// No DOM touches, no global variable mutations.
function createInitialSnake(rows: number, cols: number): Position[] {
    const cx = Math.floor(rows / 2)
    const cy = Math.floor(cols / 2)
    return [
        { x: cx, y: cy },
        { x: cx, y: cy - 1 },
        { x: cx, y: cy - 2 },
    ]
}

// Mirrors your spawnFood() — pure version.
// Takes snake as input so it won't spawn on top of it.
function spawnFood(rows: number, cols: number, snake: Position[]): Position {
    // Guard — can't place food on a 0×0 board.
    // Returns a dummy value; SET_BOARD_SIZE will overwrite it immediately.
    if (rows === 0 || cols === 0) return { x: 0, y: 0 }

    let food: Position
    do {
        food = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols),
        }
    } while (snake.some(s => s.x === food.x && s.y === food.y))
    return food
}

// ─── INITIAL STATE ────────────────────────────────────────

// We start with placeholder board dimensions (0,0).
// The real dimensions come from the DOM once the board mounts
// via a SET_BOARD_SIZE action (Phase 4).
export function createInitialState(rows = 0, cols = 0): GameState {
    const snake = createInitialSnake(rows, cols)
    return {
        snake,
        food: spawnFood(rows, cols, snake),
        direction: 'right',
        nextDirection: 'right',
        score: 0,
        timeSeconds: 0,
        status: 'idle',
        rows,
        cols,
    }
}

// ─── REDUCER ──────────────────────────────────────────────

// The reducer is just a function: (currentState, action) => newState
// It NEVER mutates state directly — always returns a new object.
// This is why you spread: { ...state, score: state.score + 10 }
// instead of: state.score += 10

export function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {

        case 'SET_BOARD_SIZE': {
            const { rows, cols } = action.payload
            const snake = createInitialSnake(rows, cols)
            return {
                ...state,
                rows,
                cols,
                snake,
                food: spawnFood(rows, cols, snake),
            }
        }

        case 'START_GAME': {
            return {
                ...state,
                status: 'playing',
            }
        }

        case 'RESTART_GAME': {
            // Reset everything EXCEPT board dimensions — screen hasn't changed
            const snake = createInitialSnake(state.rows, state.cols)
            return {
                ...createInitialState(state.rows, state.cols),
                snake,
                food: spawnFood(state.rows, state.cols, snake),
                status: 'idle',
            }
        }

        case 'CHANGE_DIRECTION': {
            const { direction, nextDirection } = state
            const d = action.payload

            // Prevent 180° reversal — you can't go right if moving left.
            // This is the same logic your keydown handler implied, now explicit.
            const opposites: Record<string, string> = {
                up: 'down', down: 'up', left: 'right', right: 'left'
            }
            if (opposites[direction] === d || opposites[nextDirection] === d) {
                return state  // ignore the input — return state unchanged
            }

            return { ...state, nextDirection: d }
            // Note: we update nextDirection, NOT direction.
            // direction only updates when MOVE fires.
            // This prevents the double-key-press bug from your JS version.
        }

        case 'TOGGLE_PAUSE': {
            if (state.status === 'playing') return { ...state, status: 'paused' }
            if (state.status === 'paused') return { ...state, status: 'playing' }
            return state  // ignore if idle or gameover
        }

        case 'MOVE': {
            // Only move if we're actually playing
            if (state.status !== 'playing') return state

            const { snake, food, nextDirection, rows, cols, score } = state

            // Sync the queued direction → actual direction
            const direction = nextDirection

            // Calculate new head position (same logic as your render() function)
            const head = snake[0]
            const newHead: Position = {
                up: { x: head.x - 1, y: head.y },
                down: { x: head.x + 1, y: head.y },
                left: { x: head.x, y: head.y - 1 },
                right: { x: head.x, y: head.y + 1 },
            }[direction]

            // Collision detection — wall or self
            const hitWall = newHead.x < 0 || newHead.x >= rows ||
                newHead.y < 0 || newHead.y >= cols
            const hitSelf = snake.some(s => s.x === newHead.x && s.y === newHead.y)

            if (hitWall || hitSelf) {
                return { ...state, status: 'gameover' }
            }

            // Did we eat food?
            const ateFood = newHead.x === food.x && newHead.y === food.y

            // Build new snake — add head, remove tail only if no food eaten
            const newSnake = [newHead, ...snake]
            if (!ateFood) newSnake.pop()

            const newScore = ateFood ? score + 10 : score
            const newFood = ateFood
                ? spawnFood(rows, cols, newSnake)
                : food

            return {
                ...state,
                direction,
                snake: newSnake,
                food: newFood,
                score: newScore,
            }
        }

        case 'GAME_OVER': {
            return {
                ...state,
                status: 'gameover',
                timeSeconds: action.payload.timeSeconds,
            }
        }

        default:
            return state
    }
}


// This is just a convenience wrapper around useReducer.
// Components import this hook instead of the raw reducer.
// They get state + dispatch — that's all they need.
export function useGameReducer() {
    const [state, dispatch] = useReducer(gameReducer, createInitialState())
    return { state, dispatch }
}
// ```

// > **Why wrap `useReducer`?** Separation of concerns. Components shouldn't need to know about `gameReducer` or `createInitialState`. They just call `useGameReducer()` and get what they need. If you change the reducer internals later, components are untouched.

// ---

// ## 🔍 Your JS vs The Reducer: Direct Mapping
// ```
// YOUR JS                              REDUCER EQUIVALENT
// ──────────────────────────────────────────────────────────────────
// let direction = 'right'          →   state.direction = 'right'
// direction = 'up'                 →   dispatch({ type: 'CHANGE_DIRECTION', payload: 'up' })

// clearInterval(interval)          →   dispatch({ type: 'MOVE' }) stops being called
// modal.style.display = "flex"     →   state.status = 'gameover' (UI reacts to this)

// Score += 10                      →   inside MOVE case: score + 10
// localStorage.setItem(...)        →   handled in Phase 13 via useEffect watching score

// snake.unshift(head)              →   [newHead, ...snake]
// snake.pop()                      →   newSnake.pop()