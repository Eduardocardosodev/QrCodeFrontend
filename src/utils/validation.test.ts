import { describe, expect, it } from 'vitest'
import {
  formatApiErrorMessage,
  isValidEmail,
  isValidPassword,
  isValidHexColor,
  isValidUrl,
  normalizeEmail,
} from './validation.ts'

describe('validation', () => {
  it('normaliza email com trim e lowercase', () => {
    expect(normalizeEmail(' Usuario@Example.com ')).toBe('usuario@example.com')
  })

  it('valida e-mail corretamente', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
  })

  it('valida senha com no mínimo 8 caracteres', () => {
    expect(isValidPassword('12345678')).toBe(true)
    expect(isValidPassword('1234567')).toBe(false)
  })

  it('valida cor hexadecimal', () => {
    expect(isValidHexColor('#000000')).toBe(true)
    expect(isValidHexColor('#FF00AA')).toBe(true)
    expect(isValidHexColor('red')).toBe(false)
    expect(isValidHexColor('#12345')).toBe(false)
  })

  it('valida URL http/https', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('ftp://example.com')).toBe(false)
    expect(isValidUrl('invalid-url')).toBe(false)
  })

  it('formata mensagens de erro da API', () => {
    expect(formatApiErrorMessage(['Erro 1', 'Erro 2'])).toBe('Erro 1 Erro 2')
    expect(formatApiErrorMessage('Falha')).toBe('Falha')
    expect(formatApiErrorMessage()).toBe('Ocorreu um erro inesperado. Tente novamente.')
  })
})
