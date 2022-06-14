<template>
    <div
        ref="dialogRef"
        class="inset-0 bg-black h-full w-full bg-opacity-50 fixed z-50 flex justify-center items-center"
        tabindex="0"
        @keydown.esc="$emit('close')"
        @click="$emit('close')"
    >
        <div class="bg-white w-11/12 md:max-w-2xl md:w-3/4 p-4 rounded-lg relative" @click.stop>
            <XIcon class="w-5 h-5 text-gray-500 absolute right-4 top-4 cursor-pointer" @click="$emit('close')" />
            <h1 class="font-medium">Share post</h1>
            <div class="p-4 rounded bg-gray-100 my-4" :class="{ 'min-h-[200px]': item?.images?.length !== 0 }">
                <div class="flex items-center">
                    <img :src="avatarImg" class="w-10 h-10 rounded-full" />
                    <p class="ml-3 font-medium">{{ item.owner.id }}</p>
                </div>
                <div class="mt-2 text-gray-600">
                    <p class="break-words">{{ item.post.body }}</p>
                </div>
                <div v-if="item?.images?.length !== 0">
                    <img :src="fetchPostImage(item.images[0])" class="rounded-lg max-h-[200px] object-cover mt-2" />
                    <div class="mt-4 flex items-center">
                        <PhotographIcon class="w-6 h-6 text-gray-500" />
                        <span class="ml-2 font-medium text-gray-500">{{ item.images.length }} images</span>
                    </div>
                </div>
            </div>
            <div class="flex flex-col">
                <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div class="overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-200">
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
                                    <tr v-for="chat in chats" :key="chat.adminId">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full">
                                                    <img
                                                        :src="
                                                            getAvatar(parseContactLocation(chat.chatId, chat.adminId))
                                                        "
                                                        class="h-10 w-10 rounded-full"
                                                    />
                                                </div>
                                                <div class="ml-4">
                                                    <div class="text-sm font-medium text-gray-900">
                                                        {{ chat.chatId }}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div
                                                v-if="!isAlreadySharedWWithPerson(chat.adminId)"
                                                class="flex items-center justify-end"
                                            >
                                                <Spinner v-if="isInQueue(chat.adminId)" small />
                                                <p
                                                    v-if="isInQueue(chat.adminId)"
                                                    class="cursor-pointer text-red-500 ml-4"
                                                    @click="cancelShare(chat.adminId)"
                                                >
                                                    Cancel
                                                </p>
                                            </div>
                                            <a
                                                v-if="
                                                    !isInQueue(chat.adminId) &&
                                                    !isAlreadySharedWWithPerson(chat.adminId)
                                                "
                                                class="text-indigo-600 hover:text-accent-800"
                                                href="#"
                                                @click="sharePostWithFriend(chat.adminId)"
                                                >Share</a
                                            >
                                            <p v-if="isAlreadySharedWWithPerson(chat.adminId)">Post shared</p>
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
    import { computed, onBeforeMount, onMounted, onBeforeUnmount, ref } from 'vue';
    import { usechatsActions, useChatsState } from '@/store/chatStore';
    import { SOCIAL_POST } from '@/store/socialStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import Spinner from '@/components/Spinner.vue';
    import { PhotographIcon, XIcon } from '@heroicons/vue/solid';
    import { sendMessageSharePost } from '@/services/socialService';
    import { Contact } from '@/types';

    const emit = defineEmits(['close']);

    const { retrieveChats } = usechatsActions();
    const { chats } = useChatsState();

    const queue = ref<string[]>([]);
    const peopleIHaveSharedWith = ref<string[]>([]);
    const dialogRef = ref<HTMLElement>(null);
    let escListener = null;

    const props = defineProps<{ item: SOCIAL_POST; avatar: any }>();

    onMounted(() => {
        dialogRef.value.focus();
    });

    const fetchPostImage = (image: { path: string }) => {
        return calcExternalResourceLink(
            `http://[${props.item.owner.location}]/api/v1/posts/download/${btoa(image.path)}`
        );
    };

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

    const parseContactLocation = (chatId: string, adminId: string) => {
        const chat = chats.value.find(item => item.chatId === chatId);
        return chat.contacts.find(contact => contact.id === adminId)['location'];
    };

    const isAlreadySharedWWithPerson = (id: string) => {
        return peopleIHaveSharedWith.value.some(item => item === id);
    };

    const cancelShare = (id: string) => {
        queue.value = queue.value.filter(item => item !== id);
    };

    const isInQueue = (id: string) => {
        return queue.value.some(item => item === id);
    };

    const getAvatar = (location: string) => {
        return calcExternalResourceLink(`http://[${location}]/api/v1/user/avatar/default`);
    };

    const avatarImg = computed(() => {
        return calcExternalResourceLink(`http://[${props.item.owner.location}]/api/v1/user/avatar/default`);
    });

    onBeforeMount(async () => {
        await retrieveChats();

        escListener = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') {
                return;
            }
            emit('close');
        };
        document.addEventListener('keyup', escListener);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('keyup', escListener);
    });
</script>

<style scoped></style>
