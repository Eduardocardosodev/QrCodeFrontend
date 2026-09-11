import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useMediaQuery } from './useMediaQuery.ts'

function TestComponent({ query }: { query: string }) {
  const matches = useMediaQuery(query)
  return <div>{matches ? 'compacto' : 'amplo'}</div>
}

describe('useMediaQuery', () => {
  it('retorna false quando a media query não corresponde', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }))

    render(<TestComponent query="(max-width: 640px)" />)
    expect(screen.getByText('amplo')).toBeInTheDocument()
  })

  it('retorna true quando a media query corresponde', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }))

    render(<TestComponent query="(max-width: 640px)" />)
    expect(screen.getByText('compacto')).toBeInTheDocument()
  })
})
