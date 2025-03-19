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
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // 自定义主题色
        modifyVars: {
          'primary-color': '#3490dc',
          'success-color': '#38b2ac',
          'warning-color': '#ecc94b',
          'error-color': '#e53e3e',
          'font-size-base': '14px',
          'border-radius-base': '4px',
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['lg-studio.natapp1.cc','www.leocoder.cn'],
    open: true,
  },
});