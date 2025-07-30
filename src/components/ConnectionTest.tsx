import { useState } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useAuth } from '../components/PrivyAuthProvider'

const ConnectionTest = () => {
  const { publicKey, connected } = useAuth()
  const [testResults, setTestResults] = useState<any>({})
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    const results: any = {}
    
    // Test 1: Environment Variables
    results.env = {
      VITE_HELIUS_RPC: import.meta.env.VITE_HELIUS_RPC ? '✅ Set' : '❌ Missing',
      VITE_HELIUS_API_KEY: import.meta.env.VITE_HELIUS_API_KEY ? '✅ Set' : '❌ Missing',
      VITE_PRIVY_APP_ID: import.meta.env.VITE_PRIVY_APP_ID ? '✅ Set' : '❌ Missing',
    }
    
    // Test 2: Wallet Connection
    results.wallet = {
      connected: connected ? '✅ Connected' : '❌ Not connected',
      publicKey: publicKey ? `✅ ${publicKey}` : '❌ No public key',
    }
    
    // Test 3: RPC Connection
    try {
      const rpcUrl = import.meta.env.VITE_HELIUS_RPC || import.meta.env.VITE_HELIUS_RPC_URL
      if (!rpcUrl) {
        results.rpc = { status: '❌ No RPC URL configured' }
      } else {
        const connection = new Connection(rpcUrl, 'confirmed')
        const slot = await connection.getSlot()
        results.rpc = {
          status: '✅ Connected',
          endpoint: rpcUrl.replace(/api-key=[\w-]+/, 'api-key=***'),
          slot: slot,
        }
        
        // Test 4: Balance Fetch
        if (publicKey) {
          try {
            const balance = await connection.getBalance(new PublicKey(publicKey))
            results.balance = {
              status: '✅ Balance fetched',
              SOL: (balance / LAMPORTS_PER_SOL).toFixed(4),
            }
          } catch (err: any) {
            results.balance = {
              status: '❌ Balance fetch failed',
              error: err.message,
            }
          }
        }
      }
    } catch (err: any) {
      results.rpc = {
        status: '❌ RPC connection failed',
        error: err.message,
      }
    }
    
    setTestResults(results)
    setTesting(false)
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md">
      <h3 className="text-lg font-bold mb-2">Connection Test</h3>
      
      <button
        onClick={runTests}
        disabled={testing}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Run Tests'}
      </button>
      
      {Object.keys(testResults).length > 0 && (
        <div className="space-y-3 text-sm">
          {Object.entries(testResults).map(([key, value]: [string, any]) => (
            <div key={key} className="border-b pb-2">
              <div className="font-semibold capitalize">{key}:</div>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConnectionTest