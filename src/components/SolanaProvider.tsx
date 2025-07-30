import { createContext, useContext, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
// Removed clusterApiUrl import - no longer using free RPC fallbacks
import { isMobileDevice, getMobileWalletConfig } from '../utils/mobileWallet'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaProviderProps {
  children: React.ReactNode
}

const SolanaProvider = ({ children }: SolanaProviderProps) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet

  // Use ONLY the paid Helius RPC endpoint - no free fallbacks
  const endpoint = useMemo(() => {
    const heliusRpc = import.meta.env.VITE_HELIUS_RPC
    
    if (!heliusRpc) {
      console.error('VITE_HELIUS_RPC not configured! Please set your paid Helius RPC endpoint in .env')
      throw new Error('Helius RPC endpoint not configured')
    }
    
    console.log('Using paid Helius RPC:', heliusRpc)
    return heliusRpc
  }, [network])

  const wallets = useMemo(
    () => {
      const mobile = isMobileDevice()
      const mobileConfig = getMobileWalletConfig()
      
      return [
        new PhantomWalletAdapter({
          // Apply mobile-specific configuration
          ...(mobile && mobileConfig)
        }),
        new SolflareWalletAdapter({ 
          network,
          // Apply mobile config to Solflare as well
          ...(mobile && mobileConfig)
        }),
        new TorusWalletAdapter(),
      ]
    },
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default SolanaProvider