import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      "laptopv3.xerus-insen.ts.net"
    ]
  },
  build: {
    target: 'esnext',
    outDir: "pb_public"
  },
  esbuild: {
    jsxImportSource: 'solid-js',
    jsxFactory: 'h',
  }
});
