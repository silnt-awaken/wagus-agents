import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Dashboard from './pages/Dashboard'
import ContextManager from './pages/ContextManager'
import CommandInterface from './pages/CommandInterface'
import RepositoryViewer from './pages/RepositoryViewer'
import PaymentPortal from './pages/PaymentPortal'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import AuthProvider from './components/AuthProvider'
import SolanaProvider from './components/SolanaProvider'

function App() {
  return (
    <SolanaProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/contexts" element={<ContextManager />} />
                <Route path="/commands" element={<CommandInterface />} />
                <Route path="/repository" element={<RepositoryViewer />} />
                <Route path="/payments" element={<PaymentPortal />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </SolanaProvider>
  )
}

export default App
