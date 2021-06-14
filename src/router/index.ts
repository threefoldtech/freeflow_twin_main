import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import FileBrowser from '@/views/app/FileBrowser.vue';
import VideoRoom from '@/views/app/VideoRoom.vue';
import Basic from '@/layout/Basic.vue';
import Chat from '@/views/app/Chat.vue';
import Single from '@/views/app/Single.vue';
import Callback from '@/views/Callback.vue';
import Unauthorised from '@/views/Unauthorised.vue';
import { isUserAuthenticated } from '@/store/userStore';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/callback',
        name: 'Callback/:signedAttempt',
        component: Callback,
        beforeEnter: async (to, from, next) => {
            console.log('Check is user is authenticated');
            if (await isUserAuthenticated()) {
                console.log('User is authenticated!');
                next();
            }
            next({ name: 'Home' });
        },
    },
    {
        path: '/unauthorized',
        name: 'Unauthorized',
        component: Unauthorised,
    },
    {
        path: '/chat',
        component: Basic,
        children: [
            {
                path: '',
                name: 'chat',
                component: Chat,
                beforeEnter: async (to, from, next) => {
                    console.log('Check is user is authenticated');
                    if (await isUserAuthenticated()) {
                        console.log('User is authenticated!');
                        next();
                    }
                    next({ name: 'Home' });
                },
            },
            {
                path: ':id',
                name: 'single',
                component: Single,
                meta: {
                    back: 'chat',
                },
                beforeEnter: async (to, from, next) => {
                    console.log('Check is user is authenticated');
                    if (await isUserAuthenticated()) {
                        console.log('User is authenticated!');
                        next();
                    }
                    next({ name: 'Home' });
                },
            },
        ],
    },
    {
        // fake security since the actual filebrowser has no security yet?
        name: 'filebrowser',
        path: '/filebrowser',
        component: FileBrowser,
        beforeEnter: async (to, from, next) => {
            console.log('Check is user is authenticated');
            if (await isUserAuthenticated()) {
                console.log('User is authenticated!');
                next();
            }
            next({ name: 'Home' });
        },
    },
    {
        name: 'videoroom',
        path: '/videoroom/:id',
        component: VideoRoom,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
