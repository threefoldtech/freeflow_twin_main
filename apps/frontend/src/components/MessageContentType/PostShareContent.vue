<template>
    <TransitionRoot
        :show="showPost"
        enter="transition-opacity duration-75"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
    >
        <div
            @click="showPost = false"
            ref="dialogRef"
            tabindex="0"
            @keydown.esc="showPost = false"
            class="z-50 inset-0 w-full h-full bg-opacity-25 bg-black fixed flex items-center justify-center drop-shadow-md"
        >
            <XIcon class="w-12 h-12 absolute right-4 top-4 text-white cursor-pointer" />
            <div
                @click.stop
                class="m-4 w-full sm:w-9/12 md:w-7/12 lg:w-2/4 xl:w-1/2 2xl:w-2/5 z-50 max-h-[95%] rounded-lg overflow-y-auto"
            >
                <Post @click.stop @refreshPost="refreshPost" :item="postData" />
            </div>
        </div>
    </TransitionRoot>
    <div
        v-if="props.message.body.images.length === 0"
        @click="goToSocialPost"
        class="bg-white rounded-lg px-4 py-2 cursor-pointer z-40"
    >
        <p class="text-lg font-semibold mb-2">Shared a post</p>
        <div class="flex items-center space-x-2">
            <img :src="avatarImg" class="w-8 h-8 rounded-full" />
            <p>{{ message.body.owner.id }}</p>
        </div>
        <p class="mt-2 text-xs text-gray-400">{{ truncatedText }}</p>
    </div>
    <div
        v-else
        @click="goToSocialPost"
        class="bg-black rounded-lg cursor-pointer relative bg-gradient-to-t from-black via-black to-transparent"
    >
        <img class="object-contain opacity-[75%] max-h-[16rem] min-h-[8rem]" :src="thumbnailImage" />
        <div class="p-4 z-40 absolute bottom-0 left-0 text-white">
            <p class="text-lg font-semibold mb-2">Shared a post</p>
            <div class="flex items-center space-x-2">
                <img :src="avatarImg" class="w-8 h-8 rounded-full" />
                <p>{{ message.body.owner.id }}</p>
            </div>
            <p class="mt-2 text-xs text-gray-200">{{ truncatedText }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Message } from '@/types';
    import { MESSAGE_POST_SHARE_BODY } from '@/store/socialStore';
    import { computed, nextTick, ref, watch } from 'vue';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { getSinglePost } from '@/services/socialService';
    import { TransitionRoot } from '@headlessui/vue';
    import Post from '@/components/Dashboard/Post.vue';
    import { XIcon } from '@heroicons/vue/solid';
    import { IPostContainerDTO } from 'custom-types/post.type';
    import { createErrorNotification } from '@/store/notificiationStore';

    const props = defineProps<{ message: Message<MESSAGE_POST_SHARE_BODY> }>();
    const showPost = ref<boolean>(false);
    const postData = ref<IPostContainerDTO | null>(null);
    const dialogRef = ref<HTMLElement>(null);

    const truncatedText = computed(() => {
        const text = props.message.body.post?.body;
        return `${props.message.body.post?.body.substring(0, 255)}${text?.length > 255 ? '...' : ''}`;
    });

    const refreshPost = (post: IPostContainerDTO) => {
        postData.value = post;
    };

    const thumbnailImage = computed(() => {
        const body = props.message.body;
        const path = `${body.owner.id}/posts/${body.images[0]}`;
        return calcExternalResourceLink(`http://[${body.owner.location}]/api/v2/files/${btoa(path)}`);
    });

    const avatarImg = computed(() => {
        return calcExternalResourceLink(`http://[${props.message.body.owner.location}]/api/v2/user/avatar/default`);
    });

    const goToSocialPost = async () => {
        const post = await getSinglePost(props.message.body.post.id, props.message.body.owner.location);
        if (!post) {
            createErrorNotification('Failed to load post', 'The post has been deleted');
            return;
        }
        postData.value = post;
        showPost.value = true;
    };

    watch(showPost, () => {
        if (showPost.value)
            nextTick(() => {
                dialogRef.value.focus();
            });
    });
</script>

<style scoped></style>
