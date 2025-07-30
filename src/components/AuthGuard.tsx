import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Wallet, Zap, Shield, Users } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, connecting, signInWithPrivy } = useAuth()

  // Show children if user is authenticated
  if (user) {
    return <>{children}</>
  }

  // Show login screen if not authenticated
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
      <div className="max-w-md w-full mx-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img 
              src="/wagus_logo.png" 
              alt="WAGUS Logo" 
              className="w-full h-full object-contain rounded-2xl shadow-2xl" 
              style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))' }} 
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            WAGUS Agents
          </h1>
          <p className="text-orange-200 text-lg">Your AI-Powered Development Platform</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">AI Agents</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Secure</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Wallet className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Web3 Ready</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Collaborative</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Welcome Back</h2>
          <p className="text-orange-100 text-center mb-6">
            Connect your wallet to access your AI development workspace
          </p>
          
          <button
            onClick={signInWithPrivy}
            disabled={connecting}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-orange-400 disabled:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed mb-4"
          >
            {connecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>


          
          <p className="text-orange-200 text-xs text-center mt-4">
            New users receive 5 free credits to get started
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-orange-300 text-sm">
            Powered by Privy & Solana
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthGuard