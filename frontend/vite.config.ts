import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Polling so edits on Windows reach the container
    watch: { usePolling: true },
    // fetch('/api/health') → backend's /health ("api" is the compose service name)
    proxy: {
      '/api': {
        target: 'http://api:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
