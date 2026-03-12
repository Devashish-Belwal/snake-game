import type { IUser } from '../models/User.model'
import type { JWTPayload } from '../config/jwt'

// Module augmentation — extends Express's built-in types
// without modifying the library itself.
declare global {
  namespace Express {
    interface Request {
      user?: IUser | JWTPayload
    }
  }
}
// ```

// > **Why a `.d.ts` file?** Declaration files (`.d.ts`) add type information without producing any JavaScript. This one says: *"Express's Request object also has a `user` property."* Without this, TypeScript would error every time you write `req.user` — even though Passport puts it there at runtime.

// ---

// ## ✅ Test the Flow

// Start your server and visit these URLs in order:

// **1. Test Google redirect:**
// ```
// http://localhost:5000/auth/google
// ```
// → Should redirect you to Google's login page

// **2. Log in with your Google account**
// → Google sends you back to `/auth/google/callback`
// → Passport runs your verify function
// → User is created in MongoDB
// → You get redirected to:
// ```
// http://localhost:5173?token=eyJhbGci...