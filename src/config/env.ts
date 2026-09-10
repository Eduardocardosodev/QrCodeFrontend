export function getApiUrl(): string {
  return import.meta.env.API_URL || ''
}
