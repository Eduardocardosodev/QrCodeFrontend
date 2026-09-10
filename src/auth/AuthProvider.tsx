import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { configureApiClient } from '../services/apiClient.ts'
import * as authService from '../services/authService.ts'
import { AuthServiceError } from '../services/authService.ts'
import type { AuthSession, LoginPayload, RegisterPayload, User } from '../types/auth.ts'
import { rotateRefreshToken } from './refreshSession.ts'
import { clearSession, loadSession, saveSession } from './sessionStorage.ts'

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  getAccessToken: () => string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function persistSession(session: AuthSession): void {
  saveSession(session)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applySession = useCallback((nextSession: AuthSession | null) => {
    setSession(nextSession)
    if (nextSession) {
      persistSession(nextSession)
    } else {
      clearSession()
    }
  }, [])

  const getCurrentSession = useCallback(() => {
    return session ?? loadSession()
  }, [session])

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    return rotateRefreshToken({
      getCurrentSession,
      applySession,
    })
  }, [applySession, getCurrentSession])

  const getAccessToken = useCallback(() => {
    return session?.accessToken ?? loadSession()?.accessToken ?? null
  }, [session])

  useEffect(() => {
    async function restoreSession() {
      const storedSession = loadSession()
      if (!storedSession) {
        setIsLoading(false)
        return
      }

      setSession(storedSession)

      try {
        const user = await authService.getMe(storedSession.accessToken)
        applySession({
          ...storedSession,
          user,
        })
      } catch (error) {
        if (error instanceof AuthServiceError && error.status === 401) {
          try {
            const refreshed = await authService.refresh(storedSession.refreshToken)
            applySession(refreshed)
          } catch {
            applySession(null)
          }
        } else {
          applySession(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [applySession])

  useEffect(() => {
    configureApiClient({
      getAccessToken,
      refreshAccessToken,
    })
  }, [getAccessToken, refreshAccessToken])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const nextSession = await authService.login(payload)
      applySession(nextSession)
    },
    [applySession],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const nextSession = await authService.register(payload)
      applySession(nextSession)
    },
    [applySession],
  )

  const logout = useCallback(async () => {
    const currentSession = session ?? loadSession()
    applySession(null)

    if (currentSession?.refreshToken) {
      try {
        await authService.logout(currentSession.refreshToken)
      } catch {
        // Sessão local já foi limpa; falha remota não bloqueia logout.
      }
    }
  }, [applySession, session])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isLoading,
      login,
      register,
      logout,
      getAccessToken,
    }),
    [session, isLoading, login, register, logout, getAccessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
