// ── BASE API CLIENT ───────────────────────────────────────
// All API calls go through this function.
// It automatically attaches the JWT if one exists in localStorage.
// This is the single place where auth headers are set —
// no component ever has to think about it.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Generic fetch wrapper — T is the expected response data type
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {

  // Attach JWT from localStorage if it exists
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    // If backend sends 401, token is expired/invalid — clear it
    if (response.status === 401) {
      localStorage.removeItem('token')
    }

    return data

  } catch (error) {
    // Network error — server unreachable
    return { success: false, error: 'Network error — is the server running?' }
  }
}