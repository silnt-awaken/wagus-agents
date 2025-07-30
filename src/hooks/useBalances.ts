import { useState, useEffect, useCallback } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError, TokenInvalidAccountOwnerError } from '@solana/spl-token'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

interface TokenBalance {
  sol: number
  usdc: number
  wagus: number
}

export const useBalances = () => {
  const { publicKey, connected } = useAuth()
  const [balances, setBalances] = useState<TokenBalance>({
    sol: 0,
    usdc: 0,
    wagus: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  // Token mint addresses
  const WAGUS_MINT = import.meta.env.VITE_WAGUS_MINT || '7BMxgTQhTthoBcQizzFoLyhmSDscM56uMramXGMhpump'
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

  // Create connection to Solana
  const connection = new Connection(
    import.meta.env.VITE_HELIUS_RPC || 'https://api.mainnet-beta.solana.com',
    'confirmed'
  )

  const fetchBalances = useCallback(async () => {
    if (!publicKey || !connected) {
      console.log('No wallet connected for balance fetching')
      return
    }

    setIsLoading(true)
    console.log('Fetching balances for wallet:', publicKey)

    try {
      const publicKeyObj = new PublicKey(publicKey)
      
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKeyObj)
      const solAmount = solBalance / LAMPORTS_PER_SOL

      // Fetch WAGUS balance
      let wagusBalance = 0
      try {
        const wagusTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(WAGUS_MINT),
          publicKeyObj
        )
        const accountInfo = await connection.getAccountInfo(wagusTokenAccount)
        if (accountInfo) {
          const tokenAccountInfo = await getAccount(connection, wagusTokenAccount)
          wagusBalance = Number(tokenAccountInfo.amount) / Math.pow(10, 6)
        }
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
          console.log('WAGUS token account not found')
        }
      }

      // Fetch USDC balance
      let usdcBalance = 0
      try {
        const usdcTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(USDC_MINT),
          publicKeyObj
        )
        const accountInfo = await connection.getAccountInfo(usdcTokenAccount)
        if (accountInfo) {
          const tokenAccountInfo = await getAccount(connection, usdcTokenAccount)
          usdcBalance = Number(tokenAccountInfo.amount) / Math.pow(10, 6)
        }
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
          console.log('USDC token account not found')
        }
      }

      setBalances({
        sol: solAmount,
        usdc: usdcBalance,
        wagus: wagusBalance
      })

      console.log('Balances updated:', { sol: solAmount, usdc: usdcBalance, wagus: wagusBalance })
    } catch (error) {
      console.error('Error fetching balances:', error)
      toast.error('Failed to fetch wallet balances')
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, connected, connection])

  // Fetch balances when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances()
    }
  }, [connected, publicKey, fetchBalances])

  return {
    balances,
    isLoading,
    refetch: fetchBalances
  }
}