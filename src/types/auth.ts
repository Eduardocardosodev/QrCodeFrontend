export type User = {
  id: string
  email: string
  createdAt: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

export type AuthSession = AuthTokens & {
  user: User
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  password: string
}

export type ApiErrorBody = {
  message?: string | string[]
  error?: string
}
