import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { useFirestoreSync } from './hooks/useFirestoreSync'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import StatsPage from './pages/StatsPage'
import AccompagnementPage from './pages/AccompagnementPage'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/" replace />
  return children
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/" replace />
  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  useFirestoreSync()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/stats"
            element={
              <AdminRoute>
                <StatsPage />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="/accompagnement" element={<AccompagnementPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
