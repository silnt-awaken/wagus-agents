# Balance Fetching Troubleshooting Guide

## Overview
This guide helps troubleshoot issues with fetching wallet balances in the WAGUS Agents React application.

## Common Issues and Solutions

### 1. RPC Endpoint Configuration

**Issue**: Balance fetching fails with "RPC endpoint not configured" error.

**Solution**:
1. Create a `.env` file in the project root (copy from `.env.example`)
2. Set the Helius RPC URL:
   ```
   VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
   ```
3. Get a free API key from https://helius.xyz
4. Restart the development server

### 2. Wallet Connection Issues

**Issue**: "No public key available for balance fetching"

**Solution**:
1. Ensure you're logged in through Privy
2. Check that a Solana wallet is connected
3. Click the "Debug" button in the Payment Portal to see wallet status
4. Try disconnecting and reconnecting your wallet

### 3. Invalid Public Key Format

**Issue**: "Invalid wallet address format"

**Solution**:
1. This usually indicates a problem with the Privy wallet integration
2. Try refreshing the page
3. Clear browser cache and localStorage
4. Reconnect your wallet

### 4. RPC Rate Limiting

**Issue**: 403 or 429 errors when fetching balances

**Solution**:
1. You're likely using a free RPC endpoint that's rate-limited
2. Get a paid Helius API key for better performance
3. Wait a few minutes before trying again
4. Consider implementing request caching

### 5. Transaction Signing Not Working

**Issue**: "Transaction signing not yet implemented for Privy wallets"

**Solution**:
The transaction signing has been implemented in the latest update. If you still see this error:
1. Pull the latest changes
2. Ensure your wallet supports transaction signing
3. Check browser console for specific errors

## Debugging Steps

1. **Check Environment Variables**
   - Open browser console
   - Click "Debug" button in Payment Portal
   - Verify all environment variables are set correctly

2. **Verify Wallet Connection**
   - Check that `publicKey` is not null
   - Ensure `connected` is true
   - Verify `authenticated` is true

3. **Test RPC Connection**
   - The balance fetching function tests the RPC connection first
   - Check console for "RPC connection successful" message
   - If this fails, your RPC endpoint is likely misconfigured

4. **Check Token Accounts**
   - SOL balance should always work if RPC is connected
   - WAGUS and USDC balances require token accounts to exist
   - If token accounts don't exist, balance will show as 0

## Code Changes Made

1. **Fixed RPC endpoint variable name** - Now checks both `VITE_HELIUS_RPC_URL` and `VITE_HELIUS_RPC`
2. **Implemented transaction signing** - Added proper Privy wallet transaction signing
3. **Improved error handling** - More specific error messages for debugging
4. **Added debug function** - Click "Debug" button to see wallet and RPC status
5. **Better PublicKey validation** - Validates public key format before use

## Testing Balance Fetching

1. Connect your wallet through Privy
2. Navigate to Payment Portal
3. Click "Refresh Balances" button
4. Check browser console for detailed logs
5. If errors occur, click "Debug" button for more info

## Mobile App Comparison

The Flutter mobile app likely uses:
- Direct wallet connection without Privy
- Different RPC endpoint configuration
- Native Solana wallet adapters

The React app uses:
- Privy for wallet management
- Web3 wallet connectors
- Browser-based transaction signing

## Next Steps

If balance fetching still doesn't work:
1. Check browser console for specific errors
2. Verify your Helius API key is valid
3. Ensure you're on Solana mainnet
4. Try with a different wallet (Phantom, Solflare, etc.)
5. Check if the issue is specific to certain tokens

## Support

For further assistance:
- Check Privy documentation: https://docs.privy.io
- Helius RPC docs: https://docs.helius.xyz
- Solana Web3.js docs: https://solana-labs.github.io/solana-web3.js/