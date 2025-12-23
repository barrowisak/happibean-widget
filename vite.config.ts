import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/embed.tsx',
      name: 'HappiBeanWidget',
      fileName: () => 'widget.iife.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        extend: true
      }
    },
    outDir: '.',
    emptyOutDir: false
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
