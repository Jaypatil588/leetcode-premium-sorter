import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/leetcode-api': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/leetcode-api/, ''),
        secure: false,
        headers: {
            'Referer': 'https://leetcode.com',
            'Origin': 'https://leetcode.com'
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const session = req.headers['x-lc-session'];
            const csrf = req.headers['x-lc-csrf'];
            if (session && csrf) {
              proxyReq.setHeader('Cookie', `LEETCODE_SESSION=${session}; csrftoken=${csrf}`);
            }
          });
        }
      }
    }
  }
})
