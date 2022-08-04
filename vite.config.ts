import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../charles_angels/server/src/main/resources/public/dist',
    emptyOutDir: true,
    assetsDir: './assets'
  }
})
