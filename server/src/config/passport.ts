import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { User } from '../models/User.model'
import { env } from './env'

// ── GOOGLE STRATEGY ───────────────────────────────────────
// This is the blueprint Passport uses when Google sends
// the user back to your /auth/google/callback route.
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.CALLBACK_URL,
    },

    // This function runs after Google authenticates the user.
    // 'profile' contains everything Google tells you about the user.
    // 'done' is Passport's callback — call it with (error, user).
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract the fields we care about from Google's profile object
        const googleId = profile.id
        const email = profile.emails?.[0]?.value ?? ''
        const name = profile.displayName
        const avatar = profile.photos?.[0]?.value ?? ''

        // Find existing user OR create a new one.
        // This is the "find or create" pattern — the most common
        // OAuth pattern. First login creates the account automatically.
        let user = await User.findOne({ googleId })

        if (!user) {
          // First time this Google account has logged in
          user = await User.create({ googleId, email, name, avatar })
          console.log(`New user created: ${name}`)
        } else {
          // Update name/avatar in case they changed it on Google
          user.name = name
          user.avatar = avatar
          await user.save()
        }

        // Pass the user to the next step (our route handler)
        done(null, user)

      } catch (error) {
        // Pass error to Passport — it will send a 500 response
        done(error as Error, undefined)
      }
    }
  )
)

export default passport