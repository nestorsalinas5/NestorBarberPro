import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Exclude these modules from the bundle. They are loaded via importmap in index.html.
      external: ['jspdf', 'html2canvas']
    }
  }
})
