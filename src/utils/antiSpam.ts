// Anti-spam protection utilities for preventing credit farming

interface DeviceFingerprint {
  canvas: string;
  webgl: string;
  audio: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  userAgent: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
}

interface SpamTrackingData {
  walletAddresses: Set<string>;
  deviceFingerprints: Set<string>;
  ipRegistrations: Map<string, number[]>; // IP -> array of timestamps
}

class AntiSpamService {
  private static instance: AntiSpamService;
  private trackingData: SpamTrackingData;
  private readonly STORAGE_KEY = 'wagus-spam-tracking';
  private readonly IP_RATE_LIMIT = 1; // Max 1 registration per IP per 24 hours
  private readonly RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in ms

  private constructor() {
    this.loadTrackingData();
  }

  public static getInstance(): AntiSpamService {
    if (!AntiSpamService.instance) {
      AntiSpamService.instance = new AntiSpamService();
    }
    return AntiSpamService.instance;
  }

  private loadTrackingData(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.trackingData = {
          walletAddresses: new Set(parsed.walletAddresses || []),
          deviceFingerprints: new Set(parsed.deviceFingerprints || []),
          ipRegistrations: new Map(parsed.ipRegistrations || [])
        };
      } else {
        this.trackingData = {
          walletAddresses: new Set(),
          deviceFingerprints: new Set(),
          ipRegistrations: new Map()
        };
      }
    } catch (error) {
      console.error('Failed to load spam tracking data:', error);
      this.trackingData = {
        walletAddresses: new Set(),
        deviceFingerprints: new Set(),
        ipRegistrations: new Map()
      };
    }
  }

  private saveTrackingData(): void {
    try {
      const dataToStore = {
        walletAddresses: Array.from(this.trackingData.walletAddresses),
        deviceFingerprints: Array.from(this.trackingData.deviceFingerprints),
        ipRegistrations: Array.from(this.trackingData.ipRegistrations.entries())
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to save spam tracking data:', error);
    }
  }

  // Generate device fingerprint using multiple browser characteristics
  public async generateDeviceFingerprint(): Promise<string> {
    const fingerprint: DeviceFingerprint = {
      canvas: await this.getCanvasFingerprint(),
      webgl: this.getWebGLFingerprint(),
      audio: await this.getAudioFingerprint(),
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory
    };

    // Create hash from fingerprint data
    const fingerprintString = JSON.stringify(fingerprint);
    return await this.hashString(fingerprintString);
  }

  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';

      canvas.width = 200;
      canvas.height = 50;
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('WAGUS Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device ID', 4, 35);

      return canvas.toDataURL();
    } catch (error) {
      return 'canvas-error';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext || 
                canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (!gl) return 'no-webgl';

      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      return `${vendor}~${renderer}`;
    } catch (error) {
      return 'webgl-error';
    }
  }

  private async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(0);
      
      return new Promise((resolve) => {
        scriptProcessor.onaudioprocess = (event) => {
          const buffer = event.inputBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            sum += Math.abs(buffer[i]);
          }
          oscillator.stop();
          audioContext.close();
          resolve(sum.toString());
        };
      });
    } catch (error) {
      return 'audio-error';
    }
  }

  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get user's IP address (simplified - in production use a proper IP service)
  public async getUserIP(): Promise<string> {
    try {
      // In a real implementation, you'd use a service like ipapi.co or ipify.org
      // For now, we'll use a simple approach
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      console.error('Failed to get IP:', error);
      return 'unknown';
    }
  }

  // Check if a new registration is allowed
  public async canRegisterNewUser(walletAddress: string): Promise<{ allowed: boolean; reason?: string }> {
    // Check if wallet already exists
    if (this.trackingData.walletAddresses.has(walletAddress)) {
      return { allowed: false, reason: 'Wallet already registered' };
    }

    // Generate device fingerprint
    const deviceFingerprint = await this.generateDeviceFingerprint();
    
    // Check if device already registered
    if (this.trackingData.deviceFingerprints.has(deviceFingerprint)) {
      return { allowed: false, reason: 'Device already used for registration' };
    }

    // Check IP rate limiting
    const userIP = await this.getUserIP();
    if (userIP !== 'unknown') {
      const ipRegistrations = this.trackingData.ipRegistrations.get(userIP) || [];
      const now = Date.now();
      
      // Clean old registrations outside the rate limit window
      const recentRegistrations = ipRegistrations.filter(
        timestamp => now - timestamp < this.RATE_LIMIT_WINDOW
      );
      
      if (recentRegistrations.length >= this.IP_RATE_LIMIT) {
        return { allowed: false, reason: 'Too many registrations from this IP address. Please try again later.' };
      }
    }

    return { allowed: true };
  }

  // Register a new user after validation
  public async registerNewUser(walletAddress: string): Promise<void> {
    const deviceFingerprint = await this.generateDeviceFingerprint();
    const userIP = await this.getUserIP();
    const now = Date.now();

    // Add to tracking data
    this.trackingData.walletAddresses.add(walletAddress);
    this.trackingData.deviceFingerprints.add(deviceFingerprint);
    
    if (userIP !== 'unknown') {
      const ipRegistrations = this.trackingData.ipRegistrations.get(userIP) || [];
      ipRegistrations.push(now);
      this.trackingData.ipRegistrations.set(userIP, ipRegistrations);
    }

    // Save to localStorage
    this.saveTrackingData();
  }

  // Clean old data to prevent localStorage from growing too large
  public cleanOldData(): void {
    const now = Date.now();
    const cleanupThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days

    // Clean old IP registrations
    for (const [ip, timestamps] of this.trackingData.ipRegistrations.entries()) {
      const recentTimestamps = timestamps.filter(
        timestamp => now - timestamp < cleanupThreshold
      );
      
      if (recentTimestamps.length === 0) {
        this.trackingData.ipRegistrations.delete(ip);
      } else {
        this.trackingData.ipRegistrations.set(ip, recentTimestamps);
      }
    }

    this.saveTrackingData();
  }
}

export default AntiSpamService;
export type { DeviceFingerprint, SpamTrackingData };