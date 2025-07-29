import React from 'react'
import { PrivyProvider as BasePrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'

interface PrivyProviderProps {
  children: React.ReactNode
}

const PrivyProvider: React.FC<PrivyProviderProps> = ({ children }) => {
  const appId = import.meta.env.VITE_PRIVY_APP_ID
  const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID
  const isDevelopment = window.location.hostname === 'localhost'

  console.log('Privy Configuration:', {
    appId: appId ? `${appId.substring(0, 10)}...` : 'MISSING',
    clientId: clientId ? `${clientId.substring(0, 20)}...` : 'MISSING',
    currentDomain: window.location.origin,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    isDevelopment,
    userAgent: navigator.userAgent.substring(0, 100)
  })

  // Privy will handle connectivity internally - no need for manual testing

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

  // Try minimal configuration first to isolate issues
  const useMinimalConfig = isDevelopment || window.location.search.includes('minimal=true')
  
  const privyConfig: PrivyClientConfig = useMinimalConfig ? {
    // Minimal configuration for debugging
    appearance: {
      theme: 'dark' as const,
    },
    loginMethods: ['email'] as const, // Start with just email
    embeddedWallets: {
      createOnLogin: 'off' as const, // Disable embedded wallets initially
    },
  } : {
    // Full configuration
    appearance: {
      theme: 'dark' as const,
      accentColor: '#ea580c', // Orange-600 to match WAGUS branding
      logo: '/wagus_logo.png',
    },
    // Wallet configuration - simplified for better compatibility
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
    },
    // External wallet support
    externalWallets: {
      solana: {
        connectors: toSolanaWalletConnectors({
          shouldAutoConnect: false, // Always disable auto-connect for now
        }),
      },
    },
    // Login methods - prioritize wallet for better compatibility
    loginMethods: ['wallet', 'email'] as const,
    // Additional configuration
    supportedChains: [
      {
        id: 101, // Solana Mainnet
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
    // Additional debugging and compatibility settings
  }

  console.log('Using Privy config (minimal=' + useMinimalConfig + '):', privyConfig)
  
  if (useMinimalConfig) {
    console.log('🔧 Running in minimal config mode. Add ?minimal=false to URL to test full config.')
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