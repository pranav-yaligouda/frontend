// vite.config.ts
import { defineConfig } from "file:///D:/Projects/AthaniMart/AthaniMart_V_1.0/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Projects/AthaniMart/AthaniMart_V_1.0/frontend/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { visualizer } from "file:///D:/Projects/AthaniMart/AthaniMart_V_1.0/frontend/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "D:\\Projects\\AthaniMart\\AthaniMart_V_1.0\\frontend";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000
  },
  plugins: [
    react(),
    mode === "production" && visualizer({ open: true, gzipSize: true, brotliSize: true })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts")) return "recharts-vendor";
            if (id.includes("date-fns")) return "date-fns-vendor";
            if (id.includes("lodash")) return "lodash-vendor";
            if (id.includes("axios")) return "axios-vendor";
            if (id.includes("sonner")) return "sonner-vendor";
            if (id.includes("lucide-react")) return "lucide-vendor";
            if (id.includes("@tanstack/react-query")) return "react-query-vendor";
            if (id.includes("@radix-ui")) return "radix-vendor";
            return "vendor";
          }
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFxBdGhhbmlNYXJ0XFxcXEF0aGFuaU1hcnRfVl8xLjBcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFByb2plY3RzXFxcXEF0aGFuaU1hcnRcXFxcQXRoYW5pTWFydF9WXzEuMFxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUHJvamVjdHMvQXRoYW5pTWFydC9BdGhhbmlNYXJ0X1ZfMS4wL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG5cclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBcclxuICAgIG1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiB2aXN1YWxpemVyKHsgb3BlbjogdHJ1ZSwgZ3ppcFNpemU6IHRydWUsIGJyb3RsaVNpemU6IHRydWUgfSksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XHJcbiAgICAgICAgICAgIC8vIERPIE5PVCBzcGxpdCByZWFjdC9yZWFjdC1kb20hXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVjaGFydHMnKSkgcmV0dXJuICdyZWNoYXJ0cy12ZW5kb3InO1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2RhdGUtZm5zJykpIHJldHVybiAnZGF0ZS1mbnMtdmVuZG9yJztcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsb2Rhc2gnKSkgcmV0dXJuICdsb2Rhc2gtdmVuZG9yJztcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdheGlvcycpKSByZXR1cm4gJ2F4aW9zLXZlbmRvcic7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc29ubmVyJykpIHJldHVybiAnc29ubmVyLXZlbmRvcic7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbHVjaWRlLXJlYWN0JykpIHJldHVybiAnbHVjaWRlLXZlbmRvcic7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JykpIHJldHVybiAncmVhY3QtcXVlcnktdmVuZG9yJztcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAcmFkaXgtdWknKSkgcmV0dXJuICdyYWRpeC12ZW5kb3InO1xyXG4gICAgICAgICAgICAvLyBhZGQgbW9yZSBsYXJnZSBsaWJyYXJpZXMgYXMgbmVlZGVkXHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBR2pCLFNBQVMsa0JBQWtCO0FBTjNCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUVOLFNBQVMsZ0JBQWdCLFdBQVcsRUFBRSxNQUFNLE1BQU0sVUFBVSxNQUFNLFlBQVksS0FBSyxDQUFDO0FBQUEsRUFDdEYsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFDZixjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFFL0IsZ0JBQUksR0FBRyxTQUFTLFVBQVUsRUFBRyxRQUFPO0FBQ3BDLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEVBQUcsUUFBTztBQUNwQyxnQkFBSSxHQUFHLFNBQVMsUUFBUSxFQUFHLFFBQU87QUFDbEMsZ0JBQUksR0FBRyxTQUFTLE9BQU8sRUFBRyxRQUFPO0FBQ2pDLGdCQUFJLEdBQUcsU0FBUyxRQUFRLEVBQUcsUUFBTztBQUNsQyxnQkFBSSxHQUFHLFNBQVMsY0FBYyxFQUFHLFFBQU87QUFDeEMsZ0JBQUksR0FBRyxTQUFTLHVCQUF1QixFQUFHLFFBQU87QUFDakQsZ0JBQUksR0FBRyxTQUFTLFdBQVcsRUFBRyxRQUFPO0FBRXJDLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
