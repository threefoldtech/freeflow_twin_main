<template>
    <AppLayout>
        <div>
            <div ref="dashboardWindow" class="flex flex-row">
                <div class="mx-auto lg:p-4 lg:px-2 w-full lg:w-[800px]">
                    <div v-if="isLoadingSocialPosts" class="fixed right-5 bottom-5 flex items-center">
                        <p class="mr-4">Loading</p>
                        <Spinner />
                    </div>
                    <CreatePost />
                    <div v-if="showLoader" class="flex justify-center my-8">
                        <Spinner />
                    </div>
                    <p class="flex justify-center my-8" v-if="isLoadingSocialPosts">Loading posts</p>
                    <PullRefresh
                        v-model="loading"
                        @refresh="
                            async () => {
                                await getAllPosts();
                                loading = false;
                            }
                        "
                        pulling-text="Pull to refresh"
                        loosing-text="Release to refresh"
                        loading-text="Loading..."
                        success-text="Refreshed"
                    >
                        <Post :is-dashboard="true" :item="item" v-for="item in allSocialPosts" :key="item.post.id" />
                    </PullRefresh>
                </div>
            </div>
            <div></div>
        </div>
    </AppLayout>
</template>
<script setup lang="ts">
    import AppLayout from '@/layout/AppLayout.vue';
    import CreatePost from '@/components/Dashboard/CreatePost.vue';
    import PullRefresh from 'pull-refresh-vue3';
    import Post from '@/components/Dashboard/Post.vue';
    import { computed, ref } from 'vue';
    import { getAllPosts } from '@/services/socialService';
    import { allSocialPosts, isLoadingSocialPosts } from '@/store/socialStore';
    import Spinner from '@/components/Spinner.vue';
    import { notificationPermissionGranted } from '@/store/notificiationStore';

    const loading = ref<boolean>(false);

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
