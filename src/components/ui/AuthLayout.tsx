import type { ReactNode } from 'react'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <div className="auth-card__logo" aria-hidden="true">P</div>
          <div>
            <h1 className="auth-card__title">{title}</h1>
          </div>
        </div>
        <p className="auth-card__subtitle">{subtitle}</p>
        {children}
        {footer ? <div className="auth-form__footer">{footer}</div> : null}
      </div>
    </div>
  )
}
