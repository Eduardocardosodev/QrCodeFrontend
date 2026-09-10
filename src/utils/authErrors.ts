import { AuthServiceError } from '../services/authService.ts'

export function getAuthFormError(error: unknown, fallback: string): string {
  if (error instanceof AuthServiceError) {
    return error.message
  }

  return fallback
}
