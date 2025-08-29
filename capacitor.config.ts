import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.37fd4d0121414b7587989c4a24ded3b7',
  appName: 'recipe-resq',
  webDir: 'dist',
  server: {
    url: 'https://37fd4d01-2141-4b75-8798-9c4a24ded3b7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;