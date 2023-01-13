import { createApp } from 'vue';
import App from './App.vue';
import './assets/index.css';
import router from '@/plugins/Router';
import '@fortawesome/fontawesome-free/js/all';
import socketIo from '@/plugins/SocketIo';
import contextmenu from 'v-contextmenu';
import 'v-contextmenu/dist/themes/default.css';
import config from '@/config';
import MessageContent from '@/components/MessageContent.vue';
import { clickOutside } from '@/plugins/ClickOutside';
import axios from 'axios';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';

FloatingVue.options.themes.menu.delay.hide = 0;
FloatingVue.options.themes.menu.delay.show = 600;

axios.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data

        return response;
    },
    function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
    }
);

const initializeFlutterInAppWebViewPolyFill = () => {
    if (globalThis.flutter_inappwebview) {
        return;
    }

    globalThis.flutter_inappwebview = {
        async callHandler(key, ...args) {
            console.log('Webview event called: ', {
                key,
                ...args,
            });
        },
    };
};

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function startVueApp() {
    initializeFlutterInAppWebViewPolyFill();

    const app = createApp(App)
        .directive('click-outside', clickOutside)
        .use(router)
        .use(FloatingVue)
        .use(contextmenu)
        .use(socketIo, {
            connection: config.baseUrl,
            options: {
                debug: true,
            },
            transports: ['websocket'],
        });

    app.component('MessageContent', MessageContent);

    app.directive('focus', {
        mounted(el) {
            el?.focus();
        },
    });

    app.use(contextmenu).mount('#app');

    await sleep(1000);

    await globalThis.flutter_inappwebview.callHandler('VUE_INITIALIZED');
}

startVueApp();
