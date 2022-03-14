<template>
    <AppLayout>
        <div>
            <div ref='dashboardWindow' class='flex flex-row'>
                <div v-if='false' class='fixed flex justify-end hidden'>
                    <nav class='mt-5 px-2 w-full sm:w-[300px] flex flex-col space-y-3 z-50'>
                        <h1 class='font-semibold text-accent-800 text-lg'>Flow</h1>
                        <a href='#'
                           class='group flex items-center px-6 py-4 text-base leading-6 font-semibold rounded-lg bg-accent-800 text-white transition duration-100'>
                            <HomeIcon class='mr-4 h-6 w-6' />
                            Dashboard
                        </a>
                        <a href='#'
                           class='group flex items-center px-6 py-4 text-base leading-6 font-semibold rounded-lg bg-transparent text-accent-800 hover:bg-accent-800 hover:text-white transition duration-100'>
                            <BellIcon class='mr-4 h-6 w-6' />
                            Notifications<span class='ml-12'>5</span>
                        </a>
                        <a href='#'
                           class='group flex items-center px-6 py-4 text-base leading-6 font-semibold rounded-lg bg-transparent text-accent-800 hover:bg-accent-800 hover:text-white transition duration-100'>
                            <UserGroupIcon class='mr-4 h-6 w-6' />
                            Communities
                        </a>
                        <a href='#'
                           class='group flex items-center px-6 py-4 text-base leading-6 font-semibold rounded-lg bg-transparent text-accent-800 hover:bg-accent-800 hover:text-white transition duration-100'>
                            <UserAddIcon class='mr-4 h-6 w-6' />
                            Contact list<span class='ml-12'>5</span>
                        </a>
                    </nav>
                </div>
                <div class='my-0 mx-auto p-4 px-2 w-full sm:w-[600px]'>
                    <div v-if='isLoadingSocialPosts' class='fixed right-5 bottom-5 flex items-center'>
                        <p class='mr-4'>Loading</p>
                        <Spinner />
                    </div>
                    <CreatePost />
                    <div v-if='showLoader' class='flex justify-center my-8'>
                        <Spinner />
                    </div>
                    <p class='flex justify-center my-8' v-if='isLoadingSocialPosts'>Loading posts</p>
                    <Post :item='item' v-for='(item, idx) in allSocialPosts' :key='item.post.id' />

                    <div v-if='showComingSoonToUhuru' @click='showComingSoonToUhuru = false'
                         class='w-full h-full inset-0 bg-black bg-opacity-75 fixed z-50 flex justify-center items-center flex-col'>
                        <p class='text-white text-lg font-semibold' @click.stop>Coming soon to Uhuru.</p>
                        <button class='text-black text-lg font-semibold mt-4 bg-white px-4 py-2 rounded-md'
                                @click='showComingSoonToUhuru = false'>Close dialog
                        </button>
                    </div>
                </div>
            </div>
            <div></div>
        </div>
    </AppLayout>
</template>
<script setup lang='ts'>
    import AppLayout from '@/layout/AppLayout.vue';
    import CreatePost from '@/components/Dashboard/CreatePost.vue';
    import Post from '@/components/Dashboard/Post.vue';
    import { computed, onBeforeMount, ref } from 'vue';
    import { showComingSoonToUhuru } from '@/services/dashboardService';
    import { getAllPosts } from '@/services/socialService';
    import { allSocialPosts, isLoadingSocialPosts } from '@/store/socialStore';
    import { BellIcon, HomeIcon, UserAddIcon, UserGroupIcon } from '@heroicons/vue/solid';
    import Spinner from '@/components/Spinner.vue';
    import { useSocketActions } from '@/store/socketStore';
    import { useAuthState } from '@/store/authStore';
    import { usechatsActions } from '@/store/chatStore';

    const { user } = useAuthState();
    const { retrieveChats } = usechatsActions();
    const dashboardWindow = ref<HTMLElement>(null);

    onBeforeMount(async () => {
        const { initializeSocket } = useSocketActions();
        initializeSocket(user.id.toString());
        await getAllPosts();
        await retrieveChats();
    });

    const showLoader = computed(() => {
        if (allSocialPosts.value.length >= 1) return false;
        return !!isLoadingSocialPosts.value;
    });

</script>

<style scoped></style>
