import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import Login           from './pages/Login'
import Dashboard       from './pages/Dashboard'
import HomeSection         from './components/sections/HomeSection'
import IncomesSection      from './components/sections/IncomesSection'
import ExpensesSection     from './components/sections/ExpensesSection'
import BillsSection        from './components/sections/BillsSection'
import CreditCardsSection  from './components/sections/CreditCardsSection'
import InvestmentsSection  from './components/sections/InvestmentsSection'

function Spinner() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? <Navigate to="/inicio" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Layout autenticado — DataProvider fica aqui para ser compartilhado por todas as páginas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DataProvider>
                  <Dashboard />
                </DataProvider>
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio"        element={<HomeSection />} />
            <Route path="ganhos"        element={<IncomesSection />} />
            <Route path="gastos"        element={<ExpensesSection />} />
            <Route path="boletos"       element={<BillsSection />} />
            <Route path="cartoes"       element={<CreditCardsSection />} />
            <Route path="investimentos" element={<InvestmentsSection />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
