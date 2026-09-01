import { defineConfig } from 'vite';

const fixedHost = '127.0.0.1';
const fixedPort = 5189;

export default defineConfig({
  server: {
    host: fixedHost,
    port: fixedPort,
    strictPort: true,
  },
  preview: {
    host: fixedHost,
    port: fixedPort,
    strictPort: true,
  },
});
