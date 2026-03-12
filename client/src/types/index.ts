// ─── GAME TYPES ───────────────────────────────────────────

// A single cell on the board — used for snake segments AND food position.
// In your JS: { x: cx, y: cy }  ← exact same shape, now enforced
export type Position = {
    x: number
    y: number
}

// The only 4 values direction can ever be.
// In your JS: let direction = 'right' ← a string, could accidentally be 'rihgt'
// In TS: Direction ← TypeScript will yell if you typo it
export type Direction = 'up' | 'down' | 'left' | 'right'

// The 3 states your game can be in — nothing else is valid.
// In your JS, you tracked this implicitly through modal visibility.
// Here it's explicit: the game IS one of these three states, always.
export type GameStatus = 'idle' | 'playing' | 'gameover' | 'paused'

// The complete game state — everything your useReducer will manage.
// Compare this to your JS globals: snake, food, Score, direction, etc.
// All of those are now one typed object.
export type GameState = {
    snake: Position[]       // array of segments, head is index [0]
    food: Position          // where the food is right now
    direction: Direction    // current movement direction
    nextDirection: Direction // queued direction (explained in Phase 3)
    score: number
    timeSeconds: number
    status: GameStatus
    rows: number            // board dimensions (computed from screen size)
    cols: number
}

// ─── AUTH / USER TYPES ────────────────────────────────────

// What we store about a logged-in user on the frontend.
// Comes from your backend's /auth/me endpoint (Phase 9).
export type User = {
    id: string
    name: string
    email: string
    avatar: string    // Google profile picture URL
}

// What the auth context will provide everywhere in the app (Phase 12).
export type AuthState = {
    user: User | null       // null = not logged in
    isLoading: boolean      // true while we're checking if user is logged in
    isAuthenticated: boolean
}

// ─── SCORE TYPES ──────────────────────────────────────────

// What you send TO the server when a game ends.
export type ScorePayload = {
    score: number
    timeSeconds: number    // in seconds — your JS tracked minutes + seconds separately,
    // we'll store as total seconds (simpler to sort/compare)
}

// What you get BACK from the server — includes server-generated fields.
export type Score = {
    id: string
    userId: string
    userName: string
    userAvatar: string
    score: number
    time: number
    playedAt: string    // ISO date string from MongoDB
}

// What the leaderboard endpoint returns.
export type LeaderboardEntry = {
    rank: number
    userName: string
    userAvatar: string
    score: number
    time: number
}

// ─── API TYPES ────────────────────────────────────────────

// Every response from your Express server will follow this shape.
// Wrapping responses consistently means you always know what to expect.
export type ApiResponse<T> = {
    success: boolean
    data?: T
    error?: string
}

// ─── GAME ACTIONS ─────────────────────────────────────────

// Every possible thing that can happen in the game.
// Each action is a distinct object with a 'type' field.
// Some carry extra data via 'payload'.

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'TOGGLE_PAUSE' }      // ← add this
  | { type: 'CHANGE_DIRECTION'; payload: Direction }
  | { type: 'MOVE' }
  | { type: 'SET_BOARD_SIZE'; payload: { rows: number; cols: number } }
  | { type: 'GAME_OVER'; payload: { timeSeconds: number } }
// same as the following:
// export type GameAction =
//   { type: 'START_GAME' }
//   | { type: 'RESTART_GAME' }
//   | { type: 'CHANGE_DIRECTION'; payload: Direction }
//   | { type: 'MOVE' }
//   | { type: 'SET_BOARD_SIZE'; payload: { rows: number; cols: number } }