
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
            // DO NOT split react/react-dom!
            if (id.includes('recharts')) return 'recharts-vendor';
            if (id.includes('date-fns')) return 'date-fns-vendor';
            if (id.includes('lodash')) return 'lodash-vendor';
            if (id.includes('axios')) return 'axios-vendor';
            if (id.includes('sonner')) return 'sonner-vendor';
            if (id.includes('lucide-react')) return 'lucide-vendor';
            if (id.includes('@tanstack/react-query')) return 'react-query-vendor';
            if (id.includes('@radix-ui')) return 'radix-vendor';
            // add more large libraries as needed
            return 'vendor';
          }
        },
      },
    },
  },
}));
