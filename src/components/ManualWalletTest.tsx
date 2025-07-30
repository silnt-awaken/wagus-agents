import { useState } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'

const ManualWalletTest = () => {
  const [walletAddress, setWalletAddress] = useState('')
  const [balances, setBalances] = useState<any>(null)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')

  const WAGUS_MINT = import.meta.env.VITE_WAGUS_MINT || '7BMxgTQhTthoBcQizzFoLyhmSDscM56uMramXGMhpump'
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

  const testManualWallet = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address')
      return
    }

    setTesting(true)
    setError('')
    setBalances(null)

    try {
      // Create connection
      const rpcUrl = import.meta.env.VITE_HELIUS_RPC || import.meta.env.VITE_HELIUS_RPC_URL
      if (!rpcUrl) {
        throw new Error('No RPC URL configured')
      }

      const connection = new Connection(rpcUrl, 'confirmed')
      console.log('Testing manual wallet:', walletAddress)

      // Validate address
      let pubKey: PublicKey
      try {
        pubKey = new PublicKey(walletAddress)
      } catch (err) {
        throw new Error('Invalid Solana address format')
      }

      // Fetch SOL balance
      const solBalance = await connection.getBalance(pubKey)
      
      // Fetch WAGUS balance
      let wagusBalance = 0
      try {
        const wagusTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(WAGUS_MINT),
          pubKey
        )
        const accountInfo = await connection.getAccountInfo(wagusTokenAccount)
        if (accountInfo) {
          const tokenAccountInfo = await getAccount(connection, wagusTokenAccount)
          wagusBalance = Number(tokenAccountInfo.amount) / Math.pow(10, 6)
        }
      } catch (err) {
        console.log('No WAGUS token account')
      }

      // Fetch USDC balance
      let usdcBalance = 0
      try {
        const usdcTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(USDC_MINT),
          pubKey
        )
        const accountInfo = await connection.getAccountInfo(usdcTokenAccount)
        if (accountInfo) {
          const tokenAccountInfo = await getAccount(connection, usdcTokenAccount)
          usdcBalance = Number(tokenAccountInfo.amount) / Math.pow(10, 6)
        }
      } catch (err) {
        console.log('No USDC token account')
      }

      setBalances({
        SOL: solBalance / LAMPORTS_PER_SOL,
        WAGUS: wagusBalance,
        USDC: usdcBalance
      })

    } catch (err: any) {
      console.error('Manual wallet test error:', err)
      setError(err.message || 'Failed to fetch balances')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">Manual Wallet Test</h3>
      <p className="text-sm text-blue-700 mb-4">
        Test balance fetching with any Solana wallet address
      </p>
      
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter Solana wallet address..."
            className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={testManualWallet}
          disabled={testing || !walletAddress}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Balance Fetching'}
        </button>
        
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            Error: {error}
          </div>
        )}
        
        {balances && (
          <div className="bg-white p-4 rounded border border-blue-200">
            <h4 className="font-semibold mb-2">Balances:</h4>
            <div className="space-y-1 text-sm">
              <div>SOL: {balances.SOL.toFixed(4)}</div>
              <div>WAGUS: {balances.WAGUS.toFixed(2)}</div>
              <div>USDC: {balances.USDC.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManualWalletTest