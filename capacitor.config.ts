
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7f7d3a45ca694538bc4bbeeade6a3f75',
  appName: 'athani-mart-connect',
  webDir: 'dist',
  server: {
    url: 'https://7f7d3a45-ca69-4538-bc4b-beeade6a3f75.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#10B981",
      androidScaleType: "CENTER_CROP",
      splashImmersive: true
    }
  },
  android: {
    allowMixedContent: true
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true
  }
};

export default config;
