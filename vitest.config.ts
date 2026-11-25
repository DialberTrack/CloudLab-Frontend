import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config'; 

// Configuración aparte de vite.config.ts: las pruebas no necesitan React, Babel ni Tailwind.
export default defineConfig({ 
  resolve: { 
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: { 
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});