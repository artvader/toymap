import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createApiHandler } from './server/api.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'toyfinder-api',
      configureServer(server) {
        server.middlewares.use('/api', createApiHandler())
      },
      configurePreviewServer(server) {
        server.middlewares.use('/api', createApiHandler())
      },
    },
  ],
})
