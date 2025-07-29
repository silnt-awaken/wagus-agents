import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { isMobileDevice, isPhantomInstalled, connectMobileWallet } from '../utils/mobileWallet'
import { toast } from 'sonner'

interface MobileWalletButtonProps {
  className?: string
  children?: React.ReactNode
}

const MobileWalletButton: React.FC<MobileWalletButtonProps> = ({ 
  className = '',
  children 
}) => {
  const { connected, connecting, connect, wallet } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)
  const mobile = isMobileDevice()

  const handleMobileConnect = async () => {
    if (!mobile) {
      // Use default wallet adapter behavior for desktop
      return
    }

    setIsConnecting(true)
    
    try {
      // On mobile, always use deep-linking approach
      toast.info('Opening Phantom app...', {
        description: 'You will be redirected to Phantom wallet app.'
      })
      
      // Use the mobile wallet connection utility for deep-linking
      await connectMobileWallet()
      
    } catch (error) {
      console.error('Mobile wallet connection failed:', error)
      toast.error('Connection failed', {
        description: 'Unable to open Phantom app. Make sure it\'s installed.',
        action: {
          label: 'Install Phantom',
          onClick: () => {
            if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
              window.open('https://apps.apple.com/app/phantom-solana-wallet/id1598432977', '_blank')
            } else {
              window.open('https://play.google.com/store/apps/details?id=app.phantom', '_blank')
            }
          }
        }
      })
    } finally {
      setIsConnecting(false)
    }
  }

  if (mobile) {
    return (
      <button
        onClick={handleMobileConnect}
        disabled={connecting || isConnecting || connected}
        className={`
          inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors
          ${connected 
            ? 'bg-green-600 text-white cursor-default' 
            : 'bg-orange-600 hover:bg-orange-700 text-white'
          }
          ${(connecting || isConnecting) ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {connecting || isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Connecting...
          </>
        ) : connected ? (
          'Connected'
        ) : (
          children || 'Connect Wallet'
        )}
      </button>
    )
  }

  // Use default WalletMultiButton for desktop
  return (
    <WalletMultiButton className={className}>
      {children}
    </WalletMultiButton>
  )
}

export default MobileWalletButton