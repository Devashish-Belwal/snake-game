import mongoose, { Document, Schema } from 'mongoose'

// ── TYPESCRIPT INTERFACE ───────────────────────────────────
// Describes what a User document looks like in TypeScript.
// Document extends Mongoose's base type — adds _id, save(), etc.
export interface IUser extends Document {
  googleId: string      // Google's unique ID for this user — never changes
  email: string
  name: string
  avatar: string        // Profile picture URL from Google
  createdAt: Date       // Added automatically by { timestamps: true }
  updatedAt: Date
}

// ── SCHEMA ─────────────────────────────────────────────────
// Describes what a User document looks like in MongoDB.
// This is Mongoose's enforcement layer.
const UserSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,     // no two users can have the same Google ID
      index: true,      // creates a DB index — makes findOne({ googleId }) fast
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,  // always store emails lowercase — prevents duplicates
    },
    name: {
      type: String,
      required: true,
      trim: true,       // strips leading/trailing whitespace automatically
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,   // auto-adds createdAt + updatedAt fields
  }
)

// ── MODEL ──────────────────────────────────────────────────
// The model is what you import and use everywhere.
// 'User' → Mongoose creates a 'users' collection in MongoDB automatically.
export const User = mongoose.model<IUser>('User', UserSchema)