# WAGUS Agents - Anti-Spam Protection System

## Overview

The WAGUS Agents application now includes a comprehensive anti-spam protection system that prevents users from farming free credits through multiple accounts, IP spoofing, or device manipulation.

## Key Features

### 1. **Reduced Free Credits**
- New users now receive **5 free credits** instead of 100
- Credits are only granted after passing anti-spam validation

### 2. **Multi-Layer Protection**

#### **Wallet Address Uniqueness**
- Each Solana wallet address can only receive free credits once
- Primary defense against multiple account creation

#### **Device Fingerprinting**
- **Canvas Fingerprinting**: Generates unique signatures based on how the browser renders graphics
- **WebGL Fingerprinting**: Uses GPU and graphics driver information
- **Audio Fingerprinting**: Analyzes audio context characteristics
- **System Information**: Screen resolution, timezone, language, platform, hardware specs

#### **IP Rate Limiting**
- Maximum 1 new registration per IP address per 24 hours
- Prevents rapid account creation from the same network
- Automatic cleanup of old IP records after 30 days

### 3. **Persistent Tracking**
- All anti-spam data stored in browser localStorage
- Survives browser restarts and page refreshes
- Automatic data cleanup to prevent storage bloat

## How It Works

### New User Registration Flow

1. **User connects Phantom wallet**
2. **System checks wallet address** against existing registrations
3. **Device fingerprint generated** using multiple browser APIs
4. **IP address obtained** and checked against rate limits
5. **Validation performed** - all three checks must pass
6. **If approved**: 5 credits granted and user data stored
7. **If blocked**: Connection rejected with specific error message

### Validation Logic

```typescript
// User is blocked if ANY of these conditions are true:
- Wallet address already registered
- Device fingerprint already used
- IP address exceeded rate limit (1 per 24 hours)
```

## Testing the System

### Browser Console Testing

Open the browser console and run these commands:

```javascript
// Test the anti-spam system
testAntiSpam()

// View current tracking data
viewAntiSpamData()

// Reset all data (for testing only)
resetAntiSpamData()
```

### Manual Testing Scenarios

1. **Normal User**: Connect wallet → Should receive 5 credits
2. **Duplicate Wallet**: Disconnect and reconnect same wallet → Should be blocked
3. **Same Device**: Try connecting different wallet → Should be blocked
4. **Rate Limiting**: Multiple attempts from same IP → Should be blocked after first

## Security Considerations

### Strengths
- **Multiple validation layers** make it difficult to bypass
- **Wallet requirement** adds real barrier to entry
- **Device fingerprinting** detects sophisticated attempts
- **IP tracking** prevents basic IP switching

### Limitations
- **Client-side storage** can be cleared by determined users
- **VPN/Proxy** can bypass IP restrictions
- **Virtual machines** might bypass device fingerprinting
- **No server-side validation** (by design for decentralization)

### Recommended Enhancements

For production deployment, consider:

1. **Server-side tracking** with database storage
2. **Blockchain verification** of wallet authenticity
3. **Advanced fingerprinting** with additional metrics
4. **Machine learning** for pattern detection
5. **CAPTCHA integration** for suspicious attempts

## Error Messages

Users will see specific error messages when blocked:

- `"Wallet already registered"`
- `"Device already used for registration"`
- `"Too many registrations from this IP address. Please try again later."`

## Configuration

Key settings in `antiSpam.ts`:

```typescript
IP_RATE_LIMIT = 1              // Max registrations per IP per window
RATE_LIMIT_WINDOW = 24 hours   // Time window for rate limiting
CLEANUP_THRESHOLD = 30 days    // How long to keep old data
```

## Files Modified

- `src/utils/antiSpam.ts` - Core anti-spam service
- `src/components/AuthProvider.tsx` - Integration with auth flow
- `src/utils/antiSpamTest.ts` - Testing utilities

## Impact on User Experience

### Legitimate Users
- **Seamless experience** - no additional steps required
- **Instant validation** - checks happen in background
- **Clear messaging** - know exactly what they're getting

### Malicious Users
- **Immediate blocking** with clear error messages
- **Multiple barriers** make farming very difficult
- **Persistent tracking** prevents easy workarounds

## Monitoring

To monitor the system effectiveness:

1. Check browser console for validation logs
2. Monitor localStorage for tracking data growth
3. Track user registration patterns
4. Review error rates and types

The anti-spam system provides robust protection while maintaining a smooth user experience for legitimate users.