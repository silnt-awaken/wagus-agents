// Polyfills must be imported first
import { Buffer } from 'buffer';
import process from 'process';

// Make polyfills available globally before any other imports
window.Buffer = Buffer;
globalThis.Buffer = Buffer;
window.process = process;
globalThis.process = process;

// Now import React and other dependencies
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from 'sonner';
import App from "./App";
import "./index.css";
import { resetAntiSpamData, viewAntiSpamData, testAntiSpamProtection } from './utils/antiSpamTest'

// Make anti-spam utilities available globally for troubleshooting
if (typeof window !== 'undefined') {
  (window as any).WAGUS_DEBUG = {
    resetAntiSpam: resetAntiSpamData,
    viewAntiSpamData: viewAntiSpamData,
    testAntiSpam: testAntiSpamProtection,
    help: () => {
      console.log(`
🔧 WAGUS Debug Functions:

• WAGUS_DEBUG.resetAntiSpam() - Clear device registration data
• WAGUS_DEBUG.viewAntiSpamData() - View current tracking data
• WAGUS_DEBUG.testAntiSpam() - Run anti-spam system test

If you're blocked, try: WAGUS_DEBUG.resetAntiSpam()
`)
    }
  }
  
  console.log('🚀 WAGUS Agents loaded. Type WAGUS_DEBUG.help() for troubleshooting commands.')
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
