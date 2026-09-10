import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider.tsx'
import { ProtectedRoute } from '../auth/ProtectedRoute.tsx'
import { DashboardPage } from '../pages/DashboardPage.tsx'
import { LoginPage } from '../pages/LoginPage.tsx'
import { QrCodeDeleteConfirmPage } from '../pages/QrCodeDeleteConfirmPage.tsx'
import { QrCodeDetailsPage } from '../pages/QrCodeDetailsPage.tsx'
import { RegisterPage } from '../pages/RegisterPage.tsx'

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/qr-codes/:id" element={<QrCodeDetailsPage />} />
          <Route
            path="/dashboard/qr-codes/:id/excluir"
            element={<QrCodeDeleteConfirmPage />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
