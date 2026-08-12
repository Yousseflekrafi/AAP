import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // nginx forwards the original Host header it received from the
    // browser, so allow the hostnames people might use to reach it.
    allowedHosts: ['localhost'],
    watch: {
      // Native OS file-watch events (inotify) don't propagate reliably
      // across the Docker Desktop bind-mount boundary on Windows/macOS —
      // chokidar eventually throws ENOMEM/ENOSPC scanning a directory and
      // kills the whole dev server. Polling avoids relying on those
      // events entirely; the interval keeps CPU usage reasonable.
      usePolling: true,
      interval: 300,
    },
  },
})
