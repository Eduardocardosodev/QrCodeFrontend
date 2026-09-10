import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'
import { AuthLayout } from '../components/ui/AuthLayout.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { getAuthFormError } from '../utils/authErrors.ts'
import { isValidEmail, isValidPassword, normalizeEmail } from '../utils/validation.ts'

type FormErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): FormErrors {
    const nextErrors: FormErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Informe seu e-mail.'
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Informe um e-mail válido.'
    }

    if (!password) {
      nextErrors.password = 'Informe sua senha.'
    } else if (!isValidPassword(password)) {
      nextErrors.password = 'A senha deve ter pelo menos 8 caracteres.'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirme sua senha.'
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'As senhas não coincidem.'
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({ email: normalizeEmail(email), password })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(getAuthFormError(error, 'Não foi possível criar a conta. Tente novamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para começar a criar QR Codes dinâmicos."
      footer={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError ? <div className="form-alert" role="alert">{formError}</div> : null}

        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />

        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />

        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  )
}
