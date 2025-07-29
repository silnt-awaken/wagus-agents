// Test utility to demonstrate anti-spam functionality
// This file can be used to test the anti-spam system in development

import AntiSpamService from './antiSpam';

// Test function to demonstrate anti-spam protection
export const testAntiSpamProtection = async () => {
  const antiSpam = AntiSpamService.getInstance();
  
  console.log('=== WAGUS Anti-Spam Protection Test ===');
  
  // Test device fingerprinting
  console.log('\n1. Generating device fingerprint...');
  const deviceFingerprint = await antiSpam.generateDeviceFingerprint();
  console.log('Device fingerprint:', deviceFingerprint.substring(0, 16) + '...');
  
  // Test IP detection
  console.log('\n2. Getting user IP...');
  const userIP = await antiSpam.getUserIP();
  console.log('User IP:', userIP);
  
  // Test wallet validation
  console.log('\n3. Testing wallet validation...');
  const testWallet1 = 'TestWallet123456789';
  const testWallet2 = 'TestWallet987654321';
  
  // First wallet should be allowed
  const validation1 = await antiSpam.canRegisterNewUser(testWallet1);
  console.log(`Wallet ${testWallet1}:`, validation1);
  
  if (validation1.allowed) {
    await antiSpam.registerNewUser(testWallet1);
    console.log('✅ First wallet registered successfully');
  }
  
  // Same wallet should be rejected
  const validation2 = await antiSpam.canRegisterNewUser(testWallet1);
  console.log(`Same wallet ${testWallet1}:`, validation2);
  
  // Different wallet from same device should be rejected
  const validation3 = await antiSpam.canRegisterNewUser(testWallet2);
  console.log(`Different wallet ${testWallet2}:`, validation3);
  
  console.log('\n=== Test Complete ===');
  console.log('\nAnti-spam protection features:');
  console.log('✅ Wallet address uniqueness');
  console.log('✅ Device fingerprinting (canvas, WebGL, audio)');
  console.log('✅ IP rate limiting (1 registration per 24 hours)');
  console.log('✅ Persistent tracking via localStorage');
  console.log('✅ Automatic cleanup of old data');
};

// Function to reset anti-spam data (for testing only)
export const resetAntiSpamData = () => {
  localStorage.removeItem('wagus-spam-tracking');
  console.log('Anti-spam data reset');
};

// Function to view current anti-spam data
export const viewAntiSpamData = () => {
  const data = localStorage.getItem('wagus-spam-tracking');
  if (data) {
    const parsed = JSON.parse(data);
    console.log('Current anti-spam data:', {
      walletAddresses: parsed.walletAddresses?.length || 0,
      deviceFingerprints: parsed.deviceFingerprints?.length || 0,
      ipRegistrations: parsed.ipRegistrations?.length || 0
    });
  } else {
    console.log('No anti-spam data found');
  }
};

// Make functions available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testAntiSpam = testAntiSpamProtection;
  (window as any).resetAntiSpamData = resetAntiSpamData;
  (window as any).viewAntiSpamData = viewAntiSpamData;
}