import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // Remove React DevTools in production
          ...(process.env.NODE_ENV === 'production' ? [['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]] : [])
        ]
      }
    }), 
    tailwindcss(), 
    viteSingleFile()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          utils: ['clsx', 'tailwind-merge', 'date-fns'],
          charts: ['recharts'],
          icons: ['@tabler/icons-react', 'lucide-react']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging in production
    sourcemap: false,
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-i18next',
      'i18next',
      'swr',
      'date-fns',
      'recharts'
    ]
  },
  // Performance improvements
  server: {
    fs: {
      // Allow serving files from one level up from the package root
      allow: ['..']
    }
  }
})
