import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'   // ⬅️ add this

export default defineConfig({
  plugins: [react(), tailwind()],           // ⬅️ and add here
})
