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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
