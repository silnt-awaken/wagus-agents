import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Dashboard from './pages/Dashboard'
import ContextManager from './pages/ContextManager'
import CommandInterface from './pages/CommandInterface'
import RepositoryViewer from './pages/RepositoryViewer'
import PaymentPortal from './pages/PaymentPortal'
import Settings from './pages/Settings'
import PromptOptimizer from './pages/PromptOptimizer'
import AgentShop from './pages/AgentShop'
import Layout from './components/Layout'
import PrivyProvider from './components/PrivyProvider'
import PrivyAuthProvider from './components/PrivyAuthProvider'
import PrivyDebug from './components/PrivyDebug'
import { useTheme } from './hooks/useTheme'

function AppContent() {
  // Initialize theme on app startup
  useTheme();
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: `rgb(var(--background))`, color: `rgb(var(--foreground))` }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contexts" element={<ContextManager />} />
          <Route path="/commands" element={<CommandInterface />} />
          <Route path="/repository" element={<RepositoryViewer />} />
          <Route path="/payments" element={<PaymentPortal />} />
          <Route path="/prompt-optimizer" element={<PromptOptimizer />} />
          <Route path="/agent-shop" element={<AgentShop />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  return (
    <PrivyProvider>
      <PrivyAuthProvider>
        <Router>
          <AppContent />
        </Router>
        <PrivyDebug />
      </PrivyAuthProvider>
    </PrivyProvider>
  )
}

export default App
