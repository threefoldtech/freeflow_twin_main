import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
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
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: [
                'purple_uhuru_logo.ico',
                'apple-touch-icon.png',
                'favicon-32x32.png',
                'favicon-16x16.png',
                'safari-pinned-tab.svg',
            ],
            manifest: {
                name: 'Uhuru',
                short_name: 'Uhuru',
                description: 'Decentralized social network',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: '/android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '/src'),
        },
    },
});
