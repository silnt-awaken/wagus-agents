import { useState, useEffect, useCallback } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError, TokenInvalidAccountOwnerError } from '@solana/spl-token'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { useWallets } from '@privy-io/react-auth'

interface TokenBalance {
  sol: number
  usdc: number
  wagus: number
}

export const useBalances = () => {
  const { connected } = useAuth()
  const { wallets } = useWallets()
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

  // Get the Solana wallet from Privy
  const solanaWallet = wallets.find(wallet => wallet.walletClientType === 'privy')

  const fetchBalances = useCallback(async () => {
    if (!connected || !solanaWallet) {
      console.log('No wallet connected for balance fetching')
      return
    }

    setIsLoading(true)
    console.log('Fetching balances using Privy wallet:', solanaWallet.address)
    console.log('Using RPC endpoint:', import.meta.env.VITE_HELIUS_RPC || 'https://api.mainnet-beta.solana.com')

    try {
      // Get wallet address directly from Privy
      const walletAddress = solanaWallet.address
      if (!walletAddress) {
        throw new Error('Wallet address not available')
      }

      console.log('Raw wallet address from Privy:', walletAddress)
      console.log('Wallet address type:', typeof walletAddress)
      console.log('Wallet address length:', walletAddress.length)
      
      // Validate and clean the wallet address
      const cleanAddress = walletAddress.trim()
      
      // Check if it's a valid Base58 string (Solana addresses are 32-44 characters)
      if (cleanAddress.length < 32 || cleanAddress.length > 44) {
        throw new Error(`Invalid wallet address length: ${cleanAddress.length}. Expected 32-44 characters.`)
      }
      
      // Check for valid Base58 characters
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
      if (!base58Regex.test(cleanAddress)) {
        console.error('Invalid characters in wallet address:', cleanAddress)
        throw new Error('Wallet address contains invalid characters')
      }
      
      console.log('Validated wallet address:', cleanAddress)
      
      // Create PublicKey object for Solana operations
      const publicKeyObj = new PublicKey(cleanAddress)
      
      // Test RPC connection first
      const slot = await connection.getSlot()
      console.log('RPC connection successful, current slot:', slot)
      
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKeyObj)
      const solAmount = solBalance / LAMPORTS_PER_SOL
      console.log('SOL balance fetched:', solAmount)

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
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          toast.error('Rate limited - please try again in a moment')
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error('Network error - check your internet connection')
        } else if (error.message.includes('Invalid public key') || error.message.includes('Non-base58 character')) {
          toast.error('Invalid wallet address format')
        } else if (error.message.includes('Wallet provider not available')) {
          toast.error('Wallet provider not ready - please try reconnecting')
        } else if (error.message.includes('Wallet address not available')) {
          toast.error('Wallet address not available - please reconnect')
        } else {
          toast.error(`Failed to fetch wallet balances: ${error.message}`)
        }
      } else {
        toast.error('Failed to fetch wallet balances')
      }
    } finally {
      setIsLoading(false)
    }
  }, [connected, solanaWallet, connection])

  // Fetch balances when wallet connects
  useEffect(() => {
    if (connected && solanaWallet) {
      fetchBalances()
    }
  }, [connected, solanaWallet, fetchBalances])

  return {
    balances,
    isLoading,
    refetch: fetchBalances
  }
}