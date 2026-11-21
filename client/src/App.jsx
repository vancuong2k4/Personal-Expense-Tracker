import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import WalletsPage from './pages/WalletsPage'
import TransactionsPage from './pages/TransactionsPage'
import BudgetsPage from './pages/BudgetsPage'
import ProfilePage from './pages/ProfilePage'
import RecurringPage from './pages/RecurringPage'
import CategoriesPage from './pages/CategoriesPage'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/wallets" element={<WalletsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/recurring" element={<RecurringPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
