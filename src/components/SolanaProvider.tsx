import { createContext, useContext, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaProviderProps {
  children: React.ReactNode
}

const SolanaProvider = ({ children }: SolanaProviderProps) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet

  // Use Helius RPC endpoint for better reliability and higher rate limits
  const endpoint = useMemo(() => {
    // Primary endpoint: Helius RPC with API key from environment variables
    const heliusRpc = import.meta.env.VITE_HELIUS_RPC_URL
    
    // Fallback endpoints in case Helius is down or not configured
    const fallbackEndpoints = [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      clusterApiUrl(network)
    ]
    
    // Use Helius if available, otherwise fall back to default endpoints
    return heliusRpc || fallbackEndpoints[0]
  }, [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
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