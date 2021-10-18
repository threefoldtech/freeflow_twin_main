<template>
    <Applayout>
        <div class="my-0 mx-auto p-4 w-2/3">
            <CreatePost />
            <Post :item="item" v-for="(item, idx) in posts" :key="idx" />
        </div>
    </Applayout>
    <div v-if="createPostModalStatus" class="fixed inset-0 w-full h-full bg-black z-40 bg-opacity-50"></div>
</template>

<script setup lang="ts">
    import Applayout from '@/layout/AppLayout.vue';
    import CreatePost from '@/components/Dashboard/CreatePost.vue';
    import Post from '@/components/Dashboard/Post.vue';
    import { onBeforeMount, ref } from 'vue';
    import { fetchPosts, posts, createPostModalStatus } from '@/services/dashboardService';

    onBeforeMount(async () => {
        await fetchPosts();
    });
</script>

<style scoped></style>
