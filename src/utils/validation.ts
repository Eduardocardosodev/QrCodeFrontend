const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(email))
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_PATTERN.test(color.trim())
}

export function formatApiErrorMessage(message?: string | string[]): string {
  if (!message) {
    return 'Ocorreu um erro inesperado. Tente novamente.'
  }

  if (Array.isArray(message)) {
    return message.join(' ')
  }

  return message
}
