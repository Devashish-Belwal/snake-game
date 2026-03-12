import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { authApi } from '../api/auth.api'

// ── CONTEXT TYPE ──────────────────────────────────────────
// Everything any component can get from useAuth()
type AuthContextType = {
  user:              User | null
  isLoading:         boolean       // true while checking token on startup
  isAuthenticated:   boolean
  loginWithGoogle:   () => void    // redirects to backend Google login
  logout:            () => void
}

// ── CREATE CONTEXT ────────────────────────────────────────
// undefined default — the useAuth() hook will guard against
// using context outside of AuthProvider
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── PROVIDER ──────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Start true — we don't know if user is logged in until we check

  // ── HANDLE TOKEN FROM URL ────────────────────────────
  // After Google login, backend redirects to /?token=eyJ...
  // We read it, store it, clean the URL, then fetch the user.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')

    if (token) {
      // Store the token
      localStorage.setItem('token', token)

      // Clean the token from the URL immediately.
      // Leaving ?token=... in the URL is a security risk —
      // it shows up in browser history and server logs.
      // replaceState changes URL without triggering a page reload.
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [])  // runs once on mount — exactly when we need it

  // ── VERIFY TOKEN + LOAD USER ─────────────────────────
  // Runs on every app load (and after the token-from-URL effect above).
  // Checks if a stored token is still valid by calling /auth/me.
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setIsLoading(false)   // no token → definitely not logged in
      return
    }

    const result = await authApi.getMe()

    if (result.success && result.data) {
      setUser(result.data)
    } else {
      // Token exists but server rejected it (expired, tampered, etc.)
      // Clear the bad token so the user can log in fresh
      localStorage.removeItem('token')
      setUser(null)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // ── AUTH ACTIONS ─────────────────────────────────────
  const loginWithGoogle = useCallback(() => {
    // Simply redirect to the backend — Passport handles the rest
    window.location.href = 'http://localhost:5000/auth/google'
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()           // tell server (optional but clean)
    localStorage.removeItem('token') // delete the token client-side
    setUser(null)                    // clear user from state → UI updates
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,  // true if user exists, false if null
      loginWithGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── HOOK ──────────────────────────────────────────────────
// This is what components import — never AuthContext directly.
// The error guard ensures you get a clear message if you forget
// to wrap the app in AuthProvider.
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth() must be used inside <AuthProvider>')
  }
  return context
}