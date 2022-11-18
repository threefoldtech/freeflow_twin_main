<template>
    <div
        ref="dialogRef"
        class="inset-0 bg-black h-full w-full bg-opacity-50 fixed z-40 flex justify-center items-center"
        tabindex="0"
        @keydown.esc="$emit('close')"
        @click="$emit('close')"
    >
        <div
            class="bg-white w-full h-full lg:max-h-[90vh] lg:max-w-2xl lg:w-3/4 lg:rounded-lg overflow-y-auto hide-scrollbar"
            @click.stop
        >
            <div class="bg-accent-700 text-white lg:rounded-tl-lg">
                <div class="px-4 pt-8 flex items-center justify-between">
                    <h1 class="font-medium">Share post</h1>
                    <XIcon class="w-6 h-6 text-accent-300 cursor-pointer" @click="$emit('close')" />
                </div>
                <div class="p-4" :class="{ 'min-h-[200px]': item?.images?.length !== 0 }">
                    <div class="flex items-center">
                        <img :src="avatarImg" class="w-10 h-10 rounded-full" />
                        <div class="ml-3">
                            <p class="font-medium">{{ item.owner.id }}</p>
                            <p class="text-xs text-gray-400">{{ timeAgo(item.post.createdOn) }}</p>
                        </div>
                    </div>
                    <div class="mt-2 text-gray-600">
                        <p v-if="!readMore && item.post.body.length > 200" class="break-words text-accent-300">
                            {{ item.post.body.slice(0, 200) }}
                        </p>
                        <p v-else class="break-words text-accent-300">{{ item.post.body }}</p>
                        <a class="text-white" v-if="item.post.body.length > 200" @click="readMore = !readMore" href="#">
                            {{ readMore ? 'Show less' : 'Read more' }}
                        </a>
                    </div>
                    <div :class="{ 'grid-cols-1': item.images.length === 1 }" class="grid grid-cols-2 my-4 gap-1">
                        <div
                            v-for="(image, idx) in item.images.slice(0, 4)"
                            :key="idx"
                            class="relative overflow-hidden cursor-pointer max-h-96"
                        >
                            <div
                                v-if="idx === 3 && item.images.length >= 5"
                                class="absolute inset-0 bg-black w-full h-full bg-opacity-50 flex justify-center items-center"
                            >
                                <p class="text-white text-2xl">+{{ item.images.length - 4 }}</p>
                            </div>
                            <img
                                :src="fetchPostImage(image)"
                                class="object-cover"
                                @click="emit('image_clicked', image)"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col lg:overflow-hidden">
                <div class="-mt-2 sm:-mx-6 lg:-mx-8">
                    <div class="pt-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div class="overflow-hidden border-b md:border-r border-gray-200">
                            <table class="w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            scope="col"
                                        >
                                            Name
                                        </th>
                                        <th class="relative px-6 py-3" scope="col">
                                            <span class="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="chat in chats" :key="chat.chatId" class="max-w-full">
                                        <td class="pl-6 py-4 truncate max-w-[1px]">
                                            <div class="flex items-center">
                                                <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full">
                                                    <AvatarImg :id="chat.chatId" :showOnlineStatus="!chat.isGroup" />
                                                </div>
                                                <div class="ml-4 w-full">
                                                    <div
                                                        class="text-sm font-medium m-0 max-w-[70%] truncate text-gray-900"
                                                    >
                                                        {{ chat.name }}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="pr-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div
                                                v-if="!isAlreadySharedWithPerson(chat.chatId)"
                                                class="flex items-center justify-end"
                                            >
                                                <Spinner v-if="isInQueue(chat.chatId)" small />
                                                <p
                                                    v-if="isInQueue(chat.chatId)"
                                                    class="cursor-pointer text-red-500 ml-4"
                                                    @click="cancelShare(chat.chatId)"
                                                >
                                                    Cancel
                                                </p>
                                            </div>
                                            <button
                                                v-if="
                                                    !isInQueue(chat.chatId) && !isAlreadySharedWithPerson(chat.chatId)
                                                "
                                                @click="sharePostWithFriend(chat.chatId)"
                                                type="button"
                                                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none"
                                            >
                                                Share
                                            </button>
                                            <p v-if="isAlreadySharedWithPerson(chat.chatId)">Post shared</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { onBeforeMount, onMounted, onBeforeUnmount, ref } from 'vue';
    import { useChatsState } from '@/store/chatStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import Spinner from '@/components/Spinner.vue';
    import { XIcon } from '@heroicons/vue/solid';
    import { sendMessageSharePost } from '@/services/socialService';
    import { IPostContainerDTO } from 'custom-types/post.type';
    import moment from 'moment';
    import AvatarImg from '@/components/AvatarImg.vue';

    const { chats } = useChatsState();

    const emit = defineEmits(['close', 'image_clicked']);
    const props = defineProps<{ item: IPostContainerDTO; avatarImg: any }>();
    const dialogRef = ref<HTMLElement>(null);
    const readMore = ref<boolean>(false);

    let escListener = null;

    onBeforeMount(async () => {
        escListener = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') {
                return;
            }
            emit('close');
        };
        document.addEventListener('keyup', escListener);
    });

    onMounted(() => {
        dialogRef.value.focus();
    });

    onBeforeUnmount(() => {
        document.removeEventListener('keyup', escListener);
    });

    const fetchPostImage = (image: string) => {
        const owner = props.item.owner;
        const path = `${owner.id}/posts/${image}`;
        return calcExternalResourceLink(`http://[${owner.location}]/api/v2/files/${btoa(path)}`);
    };

    const timeAgo = time => {
        return moment(time).fromNow();
    };

    const queue = ref<string[]>([]);
    const peopleIHaveSharedWith = ref<string[]>([]);

    const sharePostWithFriend = async (id: string) => {
        queue.value.push(id);
        setTimeout(async () => {
            if (!isInQueue(id)) return;
            queue.value = queue.value.filter(item => item !== id);
            //Do request
            await sendMessageSharePost(id, props.item);
            peopleIHaveSharedWith.value.push(id);
        }, 2000);
    };

    const isAlreadySharedWithPerson = (id: string) => {
        return peopleIHaveSharedWith.value.some(item => item === id);
    };

    const cancelShare = (id: string) => {
        queue.value = queue.value.filter(item => item !== id);
    };

    const isInQueue = (id: string) => {
        return queue.value.some(item => item === id);
    };
</script>

<style scoped></style>
