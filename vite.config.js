import { defineConfig } from 'vite';

const host = process.env.VITE_HOST || '127.0.0.1';
const basePort = Number.parseInt(process.env.VITE_PORT || '5189', 10);

// Keep a predictable starting port while allowing concurrent workspace
// instances to move to the next available port instead of failing.
const serverOptions = {
  host,
  port: Number.isFinite(basePort) ? basePort : 5189,
  strictPort: false,
};

export default defineConfig({
  server: serverOptions,
  preview: serverOptions,
});
