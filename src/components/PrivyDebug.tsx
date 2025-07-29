import React, { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

const PrivyDebug: React.FC = () => {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const [origin, setOrigin] = useState<string>('')

  useEffect(() => {
    // Log the exact origin that needs to be added to Privy dashboard
    const currentOrigin = window.location.origin
    setOrigin(currentOrigin)
    console.log('🔍 PRIVY DEBUG - Current Origin:', currentOrigin)
    console.log('📋 Add this EXACT string to Privy Dashboard > Configuration > App Settings > Domains > Allowed Origins:')
    console.log('👉', currentOrigin)
  }, [])

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h2 className="text-xl font-bold text-yellow-800 mb-4">🔧 Privy Debug Information</h2>
      
      <div className="space-y-3">
        <div className="bg-white p-3 rounded border">
          <strong className="text-red-600">IMPORTANT - Add to Privy Dashboard:</strong>
          <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
            {origin || 'Loading...'}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Copy the above origin and add it to: Privy Dashboard → Configuration → App Settings → Domains → Allowed Origins
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Privy Ready:</strong> {ready ? '✅' : '❌'}
          </div>
          <div>
            <strong>Authenticated:</strong> {authenticated ? '✅' : '❌'}
          </div>
        </div>

        {user && (
          <div className="bg-green-50 p-3 rounded">
            <strong>User Info:</strong>
            <pre className="text-xs mt-1">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}

        <div className="flex gap-2">
          {!authenticated ? (
            <button 
              onClick={login}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Privy Login
            </button>
          ) : (
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Steps to fix:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Copy the origin above</li>
            <li>Go to <a href="https://dashboard.privy.io" target="_blank" className="text-blue-600 underline">Privy Dashboard</a></li>
            <li>Navigate to Configuration → App Settings → Domains</li>
            <li>Add the exact origin to "Allowed Origins"</li>
            <li>Save and refresh this page</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default PrivyDebug