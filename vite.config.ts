import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    
    mode === 'production' && visualizer({ open: true, gzipSize: true, brotliSize: true }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'react-dom-vendor';
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('date-fns')) return 'date-fns-vendor';
            if (id.includes('zod')) return 'zod-vendor';
            if (id.includes('@radix-ui')) return 'radix-vendor';
            if (id.includes('@react-google-maps')) return 'google-maps-vendor';
            if (id.includes('@tanstack/react-query')) return 'react-query-vendor';
            if (id.includes('socket.io-client')) return 'socket-io-vendor';
            if (id.includes('axios')) return 'axios-vendor';
            if (id.includes('recharts')) return 'recharts-vendor';
            if (id.includes('sonner')) return 'sonner-vendor';
            if (id.includes('lucide-react')) return 'lucide-vendor';
            // fallback for other node_modules
            return 'vendor';
          }
        },
      },
    },
  },
}));
