<template>
    <AppLayout>
        <div>
            <div ref="dashboardWindow" class="flex flex-row">
                <div class="my-0 mx-auto lg:p-4 lg:px-2 w-full lg:w-[800px]">
                    <div v-if="isLoadingSocialPosts" class="fixed right-5 bottom-5 flex items-center">
                        <p class="mr-4">Loading</p>
                        <Spinner />
                    </div>
                    <CreatePost />
                    <div v-if="showLoader" class="flex justify-center my-8">
                        <Spinner />
                    </div>
                    <p class="flex justify-center my-8" v-if="isLoadingSocialPosts">Loading posts</p>
                    <Post :item="item" v-for="item in allSocialPosts" :key="item.post.id" />
                </div>
            </div>
            <div></div>
        </div>
    </AppLayout>
</template>
<script setup lang="ts">
    import AppLayout from '@/layout/AppLayout.vue';
    import CreatePost from '@/components/Dashboard/CreatePost.vue';
    import Post from '@/components/Dashboard/Post.vue';
    import { computed } from 'vue';
    import { getAllPosts } from '@/services/socialService';
    import { allSocialPosts, isLoadingSocialPosts } from '@/store/socialStore';
    import Spinner from '@/components/Spinner.vue';
    import { notificationPermissionGranted } from '@/store/notificiationStore';

    (async () => {
        await getAllPosts();

        Notification.requestPermission().then(result => {
            if (result === 'granted') notificationPermissionGranted.value = true;
        });
    })();
    const showLoader = computed(() => {
        if (allSocialPosts.value.length >= 1) return false;
        return !!isLoadingSocialPosts.value;
    });
</script>

<style scoped></style>
