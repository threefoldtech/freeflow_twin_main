import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import FileBrowser from '@/views/app/FileBrowser.vue';
import VideoRoom from '@/views/app/VideoRoom.vue';
import Basic from '@/layout/Basic.vue';
import Chat from '@/views/app/Chat.vue';
import Single from '@/views/app/Single.vue';
import Callback from '@/views/Callback.vue';
import Unauthorised from '@/views/Unauthorised.vue';
import EditFile from '@/views/app/EditFile.vue';
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
        meta: { requiresAuth: true },
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
                meta: { requiresAuth: true },
            },
            {
                path: ':id',
                name: 'single',
                component: Single,
                meta: {
                    back: 'chat',
                    requiresAuth: true,
                },
            },
        ],
    },
    {
        // fake security since the actual filebrowser has no security yet?
        name: 'filebrowser',
        path: '/filebrowser',
        component: FileBrowser,
        meta: { requiresAuth: true },
    },
    {
        path: '/filebrowser/edit/:id',
        name: 'editfile',
        component: EditFile,
        meta: {
            back: 'filebrowser',
            requiresAuth: true,
        }
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

router.beforeEach(async (to, from, next) => {
    if (
        to.matched.some(record => record.meta.requiresAuth) &&
        !(await isUserAuthenticated())
    ) {
        next({ name: 'Home' });
    }
    next();
});

export default router;
