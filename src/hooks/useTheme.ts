import { useState, useEffect } from 'react';

// Matrix rain effect variables
let matrixCanvas: HTMLCanvasElement | null = null;
let matrixCtx: CanvasRenderingContext2D | null = null;
let matrixAnimationId: number | null = null;
const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const matrixCharArray = matrixChars.split('');

function startMatrixRain() {
  // Remove existing canvas if any
  stopMatrixRain();
  
  // Create canvas element
  matrixCanvas = document.createElement('canvas');
  matrixCanvas.style.position = 'fixed';
  matrixCanvas.style.top = '0';
  matrixCanvas.style.left = '0';
  matrixCanvas.style.width = '100vw';
  matrixCanvas.style.height = '100vh';
  matrixCanvas.style.pointerEvents = 'none';
  matrixCanvas.style.zIndex = '-1';
  matrixCanvas.style.opacity = '0.1';
  
  document.body.appendChild(matrixCanvas);
  
  matrixCtx = matrixCanvas.getContext('2d');
  if (!matrixCtx) return;
  
  // Set canvas size
  const resizeCanvas = () => {
     if (!matrixCanvas || !matrixCtx) return;
     matrixCanvas.width = window.innerWidth;
     matrixCanvas.height = window.innerHeight;
   };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Matrix rain variables
  const fontSize = 14;
  const columns = Math.floor(matrixCanvas.width / fontSize);
  const drops: number[] = [];
  
  // Initialize drops
  for (let i = 0; i < columns; i++) {
    drops[i] = 1;
  }
  
  // Animation function
  function draw() {
    if (!matrixCtx || !matrixCanvas) return;
    
    // Black background with transparency for trail effect
    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    // Green text
    matrixCtx.fillStyle = '#0f0';
    matrixCtx.font = `${fontSize}px monospace`;
    
    // Draw characters
    for (let i = 0; i < drops.length; i++) {
      const text = matrixCharArray[Math.floor(Math.random() * matrixCharArray.length)];
      matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);
      
      // Reset drop to top randomly
      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      
      drops[i]++;
    }
  }
  
  // Start animation
  function animate() {
    draw();
    matrixAnimationId = requestAnimationFrame(animate);
  }
  
  animate();
}

function stopMatrixRain() {
  if (matrixAnimationId) {
    cancelAnimationFrame(matrixAnimationId);
    matrixAnimationId = null;
  }
  
  if (matrixCanvas) {
    document.body.removeChild(matrixCanvas);
    matrixCanvas = null;
    matrixCtx = null;
  }
}

type Theme = 'light' | 'dark';
export type WagusTheme = 'default' | 'dark' | 'neon' | 'minimal' | 'cyberpunk' | 'matrix';

const themeStyles = {
  default: {
    '--primary': '249 115 22', // orange-500
    '--primary-foreground': '255 255 255',
    '--secondary': '147 51 234', // purple-600
    '--secondary-foreground': '255 255 255',
    '--background': '255 255 255',
    '--foreground': '17 24 39', // gray-900
    '--card': '255 255 255',
    '--card-foreground': '17 24 39',
    '--border': '229 231 235', // gray-200
    '--accent': '251 146 60', // orange-400
    '--accent-foreground': '255 255 255'
  },
  dark: {
    '--primary': '249 115 22',
    '--primary-foreground': '255 255 255',
    '--secondary': '147 51 234',
    '--secondary-foreground': '255 255 255',
    '--background': '17 24 39', // gray-900
    '--foreground': '243 244 246', // gray-100
    '--card': '31 41 55', // gray-800
    '--card-foreground': '243 244 246',
    '--border': '75 85 99', // gray-600
    '--accent': '251 146 60',
    '--accent-foreground': '17 24 39'
  },
  neon: {
    '--primary': '34 197 94', // green-500
    '--primary-foreground': '0 0 0',
    '--secondary': '59 130 246', // blue-500
    '--secondary-foreground': '255 255 255',
    '--background': '15 23 42', // slate-900
    '--foreground': '34 197 94',
    '--card': '30 41 59', // slate-800
    '--card-foreground': '34 197 94',
    '--border': '34 197 94',
    '--accent': '0 255 255', // cyan
    '--accent-foreground': '0 0 0'
  },
  minimal: {
    '--primary': '107 114 128', // gray-500
    '--primary-foreground': '255 255 255',
    '--secondary': '156 163 175', // gray-400
    '--secondary-foreground': '17 24 39',
    '--background': '249 250 251', // gray-50
    '--foreground': '17 24 39',
    '--card': '255 255 255',
    '--card-foreground': '17 24 39',
    '--border': '229 231 235',
    '--accent': '107 114 128',
    '--accent-foreground': '255 255 255'
  },
  cyberpunk: {
    '--primary': '236 72 153', // pink-500
    '--primary-foreground': '255 255 255',
    '--secondary': '6 182 212', // cyan-500
    '--secondary-foreground': '0 0 0',
    '--background': '15 23 42',
    '--foreground': '236 72 153',
    '--card': '30 41 59',
    '--card-foreground': '6 182 212',
    '--border': '236 72 153',
    '--accent': '168 85 247', // purple-500
    '--accent-foreground': '255 255 255'
  },
  matrix: {
    '--primary': '0 255 0', // bright green
    '--primary-foreground': '0 0 0',
    '--secondary': '0 200 0', // darker green
    '--secondary-foreground': '0 0 0',
    '--background': '0 0 0', // pure black
    '--foreground': '0 255 0',
    '--card': '10 20 10', // very dark green
    '--card-foreground': '0 255 0',
    '--border': '0 150 0',
    '--accent': '50 255 50', // light green
    '--accent-foreground': '0 0 0'
  }
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [wagusTheme, setWagusTheme] = useState<WagusTheme>(() => {
    const savedWagusTheme = localStorage.getItem('wagusTheme') as WagusTheme;
    return savedWagusTheme || 'default';
  });

  // Check if user owns a theme
  const checkThemeOwnership = (themeName: WagusTheme): boolean => {
    if (themeName === 'default') return true; // Default theme is always free
    
    // Initialize with some default owned themes for demo purposes
    const defaultOwnedFeatures = ['dark_theme', 'neon_theme'];
    const existingFeatures = JSON.parse(localStorage.getItem('wagus-owned-features') || '[]');
    
    // Merge default features with existing ones
    const allOwnedFeatures = [...new Set([...defaultOwnedFeatures, ...existingFeatures])];
    localStorage.setItem('wagus-owned-features', JSON.stringify(allOwnedFeatures));
    
    const ownedFeatures = allOwnedFeatures;
    const themeMap: Record<WagusTheme, string> = {
      'default': '',
      'dark': 'dark_theme',
      'neon': 'neon_theme', 
      'minimal': 'minimal_theme',
      'cyberpunk': 'cyberpunk_theme',
      'matrix': 'matrix_theme'
    };
    
    return ownedFeatures.includes(themeMap[themeName]);
  };

  const applyTheme = (themeName: WagusTheme) => {
    const root = document.documentElement;
    const styles = themeStyles[themeName];
    
    // Apply CSS custom properties
    Object.entries(styles).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Apply theme class
    root.classList.remove('default', 'dark', 'neon', 'minimal', 'cyberpunk', 'matrix');
    root.classList.add(themeName);
    
    // Start Matrix rain effect if Matrix theme
    if (themeName === 'matrix') {
      startMatrixRain();
    } else {
      stopMatrixRain();
    }
    
    localStorage.setItem('wagusTheme', themeName);
  };

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    applyTheme(wagusTheme);
  }, [wagusTheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setWagusThemeInstant = (newTheme: WagusTheme) => {
    if (!checkThemeOwnership(newTheme)) {
      // Show toast notification that theme needs to be purchased
      const themeNames: Record<WagusTheme, string> = {
        'default': 'Default',
        'dark': 'Dark Theme Pro',
        'neon': 'Neon Theme',
        'minimal': 'Minimal Clean Theme',
        'cyberpunk': 'Cyberpunk Theme',
        'matrix': 'Matrix Theme'
      };
      
      console.warn(`${themeNames[newTheme]} requires WAGUS purchase. Visit the Premium Store to unlock it.`);
      return false;
    }
    
    setWagusTheme(newTheme);
    applyTheme(newTheme); // Apply immediately
    return true;
  };

  return {
    theme,
    wagusTheme,
    toggleTheme,
    setWagusTheme: setWagusThemeInstant,
    checkThemeOwnership,
    isDark: theme === 'dark'
  };
}