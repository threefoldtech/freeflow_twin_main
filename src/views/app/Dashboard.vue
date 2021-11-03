<template>
    <Applayout>
        <div class="my-0 mx-auto p-4 lg:w-3/5 2xl:w-2/6 xl:w-5/12">
            <CreatePost />
            <Post :item="item" v-for="(item, idx) in posts" :key="idx" />
            <div v-if='showComingSoonToUhuru' @click='showComingSoonToUhuru = false' class='w-full h-full inset-0 bg-black bg-opacity-75 fixed z-50 flex justify-center items-center flex-col'>
                    <p class='text-white text-lg font-semibold' @click.stop>Coming soon to Uhuru.</p>
                    <button class='text-black text-lg font-semibold mt-4 bg-white px-4 py-2 rounded-md' @click='showComingSoonToUhuru = false'>Close dialog</button>
            </div>
        </div>
    </Applayout>
</template>

<script setup lang="ts">
    import Applayout from '@/layout/AppLayout.vue';
    import CreatePost from '@/components/Dashboard/CreatePost.vue';
    import Post from '@/components/Dashboard/Post.vue';
    import { onBeforeMount, ref } from 'vue';
    import { fetchPosts, posts, showComingSoonToUhuru ,createPostModalStatus } from '@/services/dashboardService';

    onBeforeMount(async () => {
        await fetchPosts();
    });
</script>

<style scoped></style>
