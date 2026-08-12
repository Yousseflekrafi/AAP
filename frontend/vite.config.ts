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
    // Allow the Traefik-fronted hostname in addition to localhost when
    // running via docker compose.
    allowedHosts: ['localhost', 'app.localhost'],
  },
})
