import { getApiUrl } from '../config/env.ts'
import type { ApiErrorBody } from '../types/auth.ts'
import { formatApiErrorMessage } from '../utils/validation.ts'

type RequestOptions = {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  authenticated?: boolean
}

type TokenProvider = () => string | null
type RefreshHandler = () => Promise<string | null>

let accessTokenProvider: TokenProvider = () => null
let refreshHandler: RefreshHandler = async () => null

export function configureApiClient(options: {
  getAccessToken: TokenProvider
  refreshAccessToken: RefreshHandler
}): void {
  accessTokenProvider = options.getAccessToken
  refreshHandler = options.refreshAccessToken
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    return formatApiErrorMessage(body.message ?? body.error)
  } catch {
    return `Erro ${response.status}: ${response.statusText}`
  }
}

export class ApiClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, authenticated = true } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (authenticated) {
    const token = accessTokenProvider()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && authenticated) {
    const newToken = await refreshHandler()
    if (newToken) {
      return apiRequest<T>(path, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      })
    }
  }

  if (!response.ok) {
    throw new ApiClientError(await parseError(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
