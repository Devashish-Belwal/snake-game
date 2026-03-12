import mongoose, { Document, Schema } from 'mongoose'

// ── TYPESCRIPT INTERFACE ───────────────────────────────────
export interface IScore extends Document {
  userId: mongoose.Types.ObjectId   // reference to Users collection
  userName: string                  // denormalized — explained below
  userAvatar: string                // denormalized — explained below
  score: number
  timeSeconds: number
  playedAt: Date
}

// ── SCHEMA ─────────────────────────────────────────────────
const ScoreSchema = new Schema<IScore>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',          // tells Mongoose this references the User model
      required: true,
      index: true,          // fast lookup of all scores by a specific user
    },
    // Denormalized fields — storing user info directly on score
    // so leaderboard queries don't need a JOIN.
    // Explained in detail below.
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      required: true,
      min: 0,               // score can't be negative
    },
    timeSeconds: {
      type: Number,
      required: true,
      min: 0,
    },
    playedAt: {
      type: Date,
      default: Date.now,    // automatically set to current time if not provided
    },
  }
)

// ── INDEXES ────────────────────────────────────────────────
// Compound index: optimizes "top 10 scores sorted by score descending"
// This is exactly what the leaderboard query does — this index makes it instant.
ScoreSchema.index({ score: -1, playedAt: -1 })

// ── MODEL ──────────────────────────────────────────────────
export const Score = mongoose.model<IScore>('Score', ScoreSchema)