import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const serverPort = 5173;

export default defineConfig({
  plugins: [react()],
  server: {
    port: serverPort,
    host: true,
  },
});
