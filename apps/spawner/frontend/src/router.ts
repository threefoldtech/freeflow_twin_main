import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Callback from '@/views/Callback.vue';

const routes: Array<any> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/callback',
        name: 'Callback',
        component: Callback,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
