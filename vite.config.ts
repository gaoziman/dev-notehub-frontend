import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  optimizeDeps: {
    include: ['@vueform/slider']
  },
  server: {
    port: 3005,
    host: '0.0.0.0', // 确保外部可以访问
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://localhost:18889', // 使用环境变量来设置代理地址
    }
  },
});