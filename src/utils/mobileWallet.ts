// Mobile wallet utilities for proper deep-linking

// TypeScript declarations for window object
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean
      }
    }
  }
}

/**
 * Detects if the user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Detects if the user is on iOS
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Detects if the user is on Android
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

/**
 * Checks if Phantom app is installed on mobile
 * Note: On mobile browsers, we can't reliably detect if the app is installed
 * so we assume it might be and try the deep-link first
 */
export const isPhantomInstalled = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // On mobile, we can't reliably detect if Phantom app is installed
  // The injected provider only exists when already connected via the app
  if (isMobileDevice()) {
    return true // Assume it might be installed and try deep-link
  }
  
  // On desktop, check for injected provider
  return 'phantom' in window && window.phantom?.solana?.isPhantom === true
}

/**
 * Creates a deep-link URL for Phantom wallet
 */
export const createPhantomDeepLink = (dappUrl: string): string => {
  const encodedUrl = encodeURIComponent(dappUrl)
  
  if (isIOS()) {
    // iOS deep-link format
    return `phantom://browse/${encodedUrl}?ref=${encodedUrl}`
  } else if (isAndroid()) {
    // Android intent-based deep-link
    return `intent://browse/${encodedUrl}?ref=${encodedUrl}#Intent;scheme=phantom;package=app.phantom;end`
  }
  
  return dappUrl
}

/**
 * Handles mobile wallet connection with proper deep-linking
 */
export const connectMobileWallet = async (): Promise<void> => {
  if (!isMobileDevice()) {
    throw new Error('This function is only for mobile devices')
  }

  const currentUrl = window.location.href
  const deepLink = createPhantomDeepLink(currentUrl)
  
  // Always try deep-link first on mobile
  try {
    // Create a hidden iframe to attempt the deep-link
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = deepLink
    document.body.appendChild(iframe)
    
    // Clean up iframe after attempt
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
    
    // For iOS, also try direct window.location as fallback
    if (isIOS()) {
      setTimeout(() => {
        window.location.href = deepLink
      }, 500)
    }
    
  } catch (error) {
    console.error('Deep-link attempt failed:', error)
    
    // Fallback: redirect to app store
    if (isIOS()) {
      window.location.href = 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
    } else if (isAndroid()) {
      window.location.href = 'https://play.google.com/store/apps/details?id=app.phantom'
    }
  }
}

/**
 * Gets the appropriate wallet adapter configuration for mobile
 */
export const getMobileWalletConfig = () => {
  if (!isMobileDevice()) {
    return {}
  }

  return {
    config: {
      // Disable opening in new tab on mobile
      openInNewTab: false,
      // Use deep-linking
      deepLink: true,
    }
  }
}