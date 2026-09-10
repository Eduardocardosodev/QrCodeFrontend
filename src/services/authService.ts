import { getApiUrl } from '../config/env.ts'
import type {
  ApiErrorBody,
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from '../types/auth.ts'
import { formatApiErrorMessage, normalizeEmail } from '../utils/validation.ts'

const AUTH_ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
  me: '/auth/me',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
} as const

export class AuthServiceError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthServiceError'
    this.status = status
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    return formatApiErrorMessage(body.message ?? body.error)
  } catch {
    return `Erro ${response.status}: ${response.statusText}`
  }
}

function normalizeCredentials(payload: LoginPayload): LoginPayload {
  return {
    email: normalizeEmail(payload.email),
    password: payload.password,
  }
}

async function requestJson<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    accessToken?: string
  } = {},
): Promise<T> {
  const { method = 'POST', body, accessToken } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new AuthServiceError(await parseError(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  return requestJson<AuthSession>(AUTH_ENDPOINTS.register, {
    body: normalizeCredentials(payload),
  })
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  return requestJson<AuthSession>(AUTH_ENDPOINTS.login, {
    body: normalizeCredentials(payload),
  })
}

export async function getMe(accessToken: string): Promise<User> {
  return requestJson<User>(AUTH_ENDPOINTS.me, {
    method: 'GET',
    accessToken,
  })
}

export async function refresh(refreshToken: string): Promise<AuthSession> {
  return requestJson<AuthSession>(AUTH_ENDPOINTS.refresh, {
    body: { refreshToken },
  })
}

export async function logout(refreshToken: string): Promise<void> {
  await requestJson<void>(AUTH_ENDPOINTS.logout, {
    body: { refreshToken },
  })
}
