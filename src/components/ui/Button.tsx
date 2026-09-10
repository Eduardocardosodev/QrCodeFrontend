import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'button',
        variant === 'primary' && 'button--primary',
        variant === 'secondary' && 'button--secondary',
        fullWidth && 'button--full',
        className,
      )}
      {...props}
    />
  )
}
