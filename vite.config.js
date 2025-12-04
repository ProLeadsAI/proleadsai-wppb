import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: 'admin/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'admin/src/main.js',
      output: {
        entryFileNames: 'proleadsai-admin.js',
        assetFileNames: 'proleadsai-admin.[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './admin/src')
    }
  }
})
