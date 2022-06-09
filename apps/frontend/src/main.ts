import { createApp } from 'vue';
import App from './App.vue';
import './assets/index.css';
import router from '@/plugins/Router';
import '@fortawesome/fontawesome-free/js/all';
import socketIo from '@/plugins/SocketIo';
import contextmenu from 'v-contextmenu';
import 'v-contextmenu/dist/themes/default.css';
import config from '@/config';
('@/config');
import MessageContent from '@/components/MessageContent.vue';
import { clickOutside } from '@/plugins/ClickOutside';
import axios from 'axios';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';
// console.log(Socketio)
// const a = Socketio.install

FloatingVue.options.themes.menu.delay.hide = 0;
FloatingVue.options.themes.menu.delay.show = 600;

const app = createApp(App)
    .directive('click-outside', clickOutside)
    .use(router)
    .use(FloatingVue)
    .use(socketIo, {
        connection: config.baseUrl,
        options: {
            debug: true,
        },
        transports: ['websocket'],
    });

// this fixes some issues with rendering inside of QouteContent n
app.component('MessageContent', MessageContent);

app.directive('focus', {
    // When the bound element is mounted into the DOM...
    mounted(el) {
        // Focus the element
        el.focus();
    },
});

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

app.use(contextmenu).mount('#app');
export default app;