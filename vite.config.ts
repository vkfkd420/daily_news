import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { briefingApiPlugin } from './server/briefingApiPlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), briefingApiPlugin(env)],
    server: {
      port: 3000,
      strictPort: false,
    },
  };
});
