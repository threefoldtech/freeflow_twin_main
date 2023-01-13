import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 8080,
        hmr: {
            host: process.env.BaseURL,
            port: 8080,
            clientPort: 443,
            protocol: 'wss',
        },
    },
    plugins: [vue()],
    resolve: {
        preserveSymlinks: true,
        alias: {
            '@': path.resolve(__dirname, '/src'),
        },
    },
});
