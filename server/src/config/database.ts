import mongoose from 'mongoose'
import { env } from './env'

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    // Exit the process — server is useless without a DB
    process.exit(1)
  }
}

// Listen for connection events after initial connect.
// These handle drops and reconnects during runtime.
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected')
})