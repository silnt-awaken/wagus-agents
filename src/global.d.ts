declare global {
  interface Window {
    Buffer: typeof import('buffer').Buffer;
    privyErrors?: string[];
  }
  
  interface FetchFunction {
    originalFetch?: typeof fetch;
  }
}

export {};