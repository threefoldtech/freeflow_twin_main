<template>
    <Applayout>
        <div class="my-0 mx-auto p-4 lg:w-3/5 2xl:w-2/6 xl:w-5/12">
            <CreatePost />
            <Post :item="item" v-for="(item, idx) in posts" :key="idx" />
        </div>
    </Applayout>
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
