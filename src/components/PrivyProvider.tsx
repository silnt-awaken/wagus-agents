import React from 'react'
import { PrivyProvider as BasePrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'

interface PrivyProviderProps {
  children: React.ReactNode
}

const PrivyProvider: React.FC<PrivyProviderProps> = ({ children }) => {
  const appId = import.meta.env.VITE_PRIVY_APP_ID
  const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID

  if (!appId || !clientId) {
    console.error('Missing Privy configuration - check .env file')
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
          <p>Missing Privy configuration. Check your .env file.</p>
        </div>
      </div>
    )
  }

  const privyConfig: PrivyClientConfig = {
    appearance: {
      theme: 'dark' as const,
      accentColor: '#ea580c',
      logo: '/wagus_logo.png',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
    },
    externalWallets: {
      solana: {
        connectors: toSolanaWalletConnectors({
          shouldAutoConnect: false,
        }),
      },
    },
    loginMethods: ['wallet', 'email'] as const,
    supportedChains: [
      {
        id: 101,
        name: 'Solana',
        network: 'mainnet-beta',
        nativeCurrency: {
          name: 'Solana',
          symbol: 'SOL',
          decimals: 9,
        },
        rpcUrls: {
          default: {
            http: [import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com'],
          },
        },
      },
    ],
  }

  return (
    <BasePrivyProvider
      appId={appId}
      clientId={clientId}
      config={privyConfig}
    >
      {children}
    </BasePrivyProvider>
  )
}

export default PrivyProvider