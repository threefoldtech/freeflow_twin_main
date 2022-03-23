import { createRouter, createWebHistory, RouteRecordRaw, RouterView } from 'vue-router';
import Home from '@/views/Home.vue';
import FileBrowser from '@/views/app/FileBrowser.vue';
import VideoRoom from '@/views/app/VideoRoom.vue';
import Forum from '@/views/app/Forum.vue';
import Browser from '@/views/app/Browser.vue';
import Kutana from '@/views/app/Kutana.vue';
import Chat from '@/views/app/Chat.vue';
import Conversation from '@/views/app/Conversation.vue';
import Callback from '@/views/Callback.vue';
import Unauthorised from '@/views/Unauthorised.vue';
import EditFile from '@/views/app/EditFile.vue';
import EditOptions from '@/views/app/EditOptions.vue';
import { isUserAuthenticated } from '@/store/userStore';
import PageNotFound from '@/views/PageNotFound.vue';
import { AppType } from '@/types/apps';
import { disableSidebar } from '@/services/sidebarService';
import Dashboard from '@/views/app/Dashboard.vue';
import {
    loadSharedItems,
    currentDirectory,
    selectedPaths,
    chatsWithFiles,
    isQuantumChatFiles,
    updateAttachments,
    savedAttachments,
    savedAttachmentsBreadcrumbs,
    savedAttachmentsIsLoading,
    fetchBasedOnRoute,
    sharedFolderIsloading,
    sharedDir,
    showSharedFolderErrorModal,
    loadLocalFolder,
    updateContent,
    stopTimer,
} from '@/store/fileBrowserStore';

import { setHasBrowserBeenStartedOnce } from '@/store/browserStore';

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
        path: '/whisper',
        component: RouterView,
        children: [
            {
                path: '',
                name: 'whisper',
                component: Chat,
                meta: { requiresAuth: true, app: AppType.Whisper },
            },
            {
                path: ':id',
                name: 'single',
                component: Conversation,
                meta: {
                    back: 'whisper',
                    requiresAuth: true,
                    app: AppType.Whisper,
                },
            },
        ],
    },
    {
        path: '/quantum/edit/:path/:shareId?/:attachments',
        name: 'editfile',
        component: EditFile,
        meta: {
            back: 'quantum',
            requiresAuth: true,
            app: AppType.Quantum,
        },
    },
    {
        path: '/quantum/options/:path/:shareId?/:attachments',
        name: 'editoptions',
        component: EditOptions,
        meta: {
            back: 'quantum',
            requiresAuth: true,
            app: AppType.Quantum,
        },
    },
    {
        path: '/quantum',
        name: 'quantum',
        component: FileBrowser,
        meta: {
            back: 'quantum',
            requiresAuth: true,
            app: AppType.Quantum,
            root_parent: 'quantum',
        },
        children: [
            {
                path: ':folder',
                name: 'quantumFolder',
                component: FileBrowser,
                meta: {},
            },
            {
                path: 'sent',
                name: 'filesSentInChat',
                component: FileBrowser,
                meta: { sharedFolder: true, received: false, chatFiles: true, chatsWithFiles: true },
                children: [
                    {
                        component: FileBrowser,
                        ///quantum/shared/:sharedId
                        name: 'filesSentInChatNested',
                        path: ':chatId',
                        meta: {
                            root_parent: 'quantum',
                            sharedFolder: true,
                            received: false,
                            chatFiles: true,
                            chatFilesNested: true,
                        },
                    },
                ],
            },
            {
                path: 'received',
                name: 'filesReceivedInChat',
                component: FileBrowser,
                meta: {
                    sharedFolder: true,
                    received: true,
                    chatFiles: true,
                    chatsWithFiles: true,
                },
                children: [
                    {
                        component: FileBrowser,
                        ///quantum/shared/:sharedId
                        name: 'filesReceivedInChatNested',
                        path: ':chatId',
                        meta: {
                            root_parent: 'quantum',
                            sharedFolder: true,
                            received: true,
                            chatFiles: true,
                            chatFilesNested: true,
                        },
                    },
                ],
            },
            {
                path: 'savedAttachments',
                name: 'savedAttachments',
                component: FileBrowser,
                children: [
                    {
                        component: FileBrowser,
                        ///quantum/savedAttachments/:chatId
                        name: 'savedAttachmentsFromChat',
                        path: ':chatId',
                        meta: {
                            sharedFolder: false,
                            root_parent: 'quantum',
                        },
                    },
                ],
            },
            {
                path: 'shared',
                name: 'sharedWithMe',
                component: FileBrowser,
                meta: {
                    back: 'quantum',
                    requiresAuth: true,
                    app: AppType.Quantum,
                    root_parent: 'quantum',
                    sharedFolder: true,
                },
                children: [
                    {
                        component: FileBrowser,
                        ///quantum/shared/:sharedId
                        name: 'sharedWithMeItem',
                        path: ':sharedId',
                        meta: {
                            root_parent: 'quantum',
                            sharedFolder: true,
                        },
                        children: [
                            {
                                ///quantum/shared/:sharedId/:path
                                path: ':path',
                                name: 'sharedWithMeItemNested',
                                component: FileBrowser,
                                meta: {
                                    root_parent: 'quantum',
                                    sharedFolder: true,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        name: 'forum',
        path: '/forum',
        component: Forum,
        meta: {
            app: AppType.Forum,
        },
    },
    {
        name: 'dashboard',
        path: '/dashboard',
        component: Dashboard,
        meta: {
            app: AppType.Dashboard,
            requiresAuth: true,
        },
    },
    {
        name: 'glass',
        path: '/glass',
        component: Browser,
        meta: {
            app: AppType.Glass,
        },
    },
    {
        name: 'videoroom',
        path: '/videoroom/:id',
        component: VideoRoom,
        meta: {
            app: AppType.Meetings,
        },
    },
    {
        name: 'kutana',
        path: '/kutana',
        component: Kutana,
        meta: {
            app: AppType.Kutana,
        },
    },
    {
        name: '404',
        path: '/:pathMatch(.*)*',
        component: PageNotFound,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth) && !(await isUserAuthenticated())) {
        next({ name: 'Home' });
    }
    //Starts the browser if the user navigates to /glass as first page
    if (to.name === 'glass') {
        setHasBrowserBeenStartedOnce();
    }
    if (to.name === 'sharedWithMe') {
        sharedDir.value = true;
    }
    next();
});

router.afterEach(async (to, from) => {
    //If file takes too long to load, if you switch page you still get the error modal. Now it doesn't
    stopTimer();
    chatsWithFiles.value = [];
    selectedPaths.value = [];
    isQuantumChatFiles.value = false;
    savedAttachments.value = false;
    if (
        to.meta.root_parent === 'quantum' &&
        to.name !== 'quantumFolder' &&
        to.name !== 'quantum' &&
        to.name !== 'savedAttachments'
    ) {
        await fetchBasedOnRoute();
        loadSharedItems();
    } else {
        sharedFolderIsloading.value = false;
        showSharedFolderErrorModal.value = false;
    }
    if (to.name === 'quantumFolder') {
        loadLocalFolder();
    }
    if (to.meta.sharedFolder) {
        sharedDir.value = true;
    }
    if (to.name === 'savedAttachments') {
        savedAttachmentsBreadcrumbs.value = [];
        sharedDir.value = false;
        savedAttachments.value = true;
        isQuantumChatFiles.value = false;
        savedAttachmentsBreadcrumbs.value.push({ name: 'Saved attachments', path: '/quantum/savedAttachments' });
        await updateAttachments('/');
        savedAttachmentsIsLoading.value = false;
    }
    if (to.name === 'savedAttachmentsFromChat') {
        savedAttachmentsIsLoading.value = true;
        savedAttachmentsBreadcrumbs.value = [];
        savedAttachments.value = true;
        sharedDir.value = false;
        isQuantumChatFiles.value = false;
        savedAttachmentsBreadcrumbs.value.push({ name: 'Saved attachments', path: '/quantum/savedAttachments' });
        await updateAttachments(`/${to.params.chatId}`);
        savedAttachmentsBreadcrumbs.value.push({
            name: to.params.chatId,
            path: `/quantum/savedAttachments/${to.params.chatId}`,
        });
        savedAttachmentsIsLoading.value = false;
    }
    if (to.name === 'quantum') {
        sharedDir.value = false;
        currentDirectory.value = '/';
        await updateContent('/');
    }
});

router.beforeEach(async (to, from, next) => {
    if (document.body.clientWidth < 1280) {
        disableSidebar();
    }
    next();
});

export default router;
