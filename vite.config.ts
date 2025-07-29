import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
// Removed Trae badge plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    // Removed Trae badge plugin 
    tsconfigPaths()
  ],
  define: {
    global: 'globalThis',
    'process.env': {},
    'globalThis.Buffer': 'Buffer',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser.js',
      stream: 'stream-browserify',
      util: 'util',
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'stream-browserify',
      'util',
      'crypto-browserify',
      '@solana/web3.js',
      '@solana/spl-token'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [],
    },
  },
})
