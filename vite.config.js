import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true // listen on IPv4 (127.0.0.1) and the LAN address too, not just IPv6 ::1
  },
})
