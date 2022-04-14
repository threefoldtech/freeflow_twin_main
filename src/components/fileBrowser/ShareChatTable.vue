<template>
    <div class="my-2 relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
        </div>
        <input
            v-model="searchTerm"
            class="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search"
            type="text"
            @focus="handleInput"
            @input="handleInput"
        />
        <div
            v-if="!!searchTerm"
            @click="searchTerm = ''"
            class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
        >
            <i class="fa fa-window-close h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
    </div>
    <div class="flex flex-col">
        <div class="-my-2">
            <div class="py-2 align-middle inline-block min-w-full">
                <div class="shadow border-b overflow-auto border-gray-200 sm:rounded-lg" style="max-height: 500px">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 z-50"
                                    scope="col"
                                >
                                    Chats
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 z-50"
                                    scope="col"
                                ></th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 z-50"
                                    scope="col"
                                ></th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="item in searchResults" :key="item.id">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <AvatarImg :id="item.chatId" alt="chat image" />
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">
                                                {{ item.name }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div
                                        class="cursor-pointer rounded-xl bg-gray-50 border border-gray-200 w-28 justify-between flex content-center items-center"
                                    >
                                        <span
                                            :class="{ 'bg-primary text-white': !item.canWrite }"
                                            class="p-2 rounded-xl"
                                            @click="item.canWrite = false"
                                        >
                                            Read</span
                                        >
                                        <span
                                            :class="{ 'bg-primary text-white': item.canWrite }"
                                            class="p-2 rounded-xl"
                                            @click="item.canWrite = true"
                                        >
                                            Write</span
                                        >
                                    </div>
                                </td>

                                <td class="text-center">
                                    <button
                                        v-if="!item.isAlreadySent && !item.loading"
                                        class="text-white py-2 px-4 rounded-md justify-self-end bg-primary"
                                        @click="shareFile(item.chatId)"
                                    >
                                        Share
                                    </button>
                                    <div v-if="item.loading" class="py-2 px-4">
                                        <Spinner small />
                                    </div>
                                    <span v-if="item.isAlreadySent" class="text-xs"> File has been shared.</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { Chat } from '@/types';
    import Spinner from '@/components/Spinner.vue';
    import { selectedPaths, addShare, PathInfoModel } from '@/store/fileBrowserStore';
    import { defineComponent, ref, computed, onMounted, onBeforeMount } from 'vue';
    import Toggle from '@/components/Toggle.vue';
    import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
    import { sendMessageObject, usechatsActions, useChatsState } from '@/store/chatStore';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { SystemMessageTypes, MessageTypes } from '@/types';
    import { createNotification } from '@/store/notificiationStore';
    import { SearchIcon } from '@heroicons/vue/solid';

    interface IProps {
        data: any[];
        selectedFile?: PathInfoModel;
    }

    const props = defineProps<IProps>();
    const emit = defineEmits(['update:modelValue', 'clicked']);

    const { sendMessage } = usechatsActions();

    const searchTerm = ref('');
    const chats = ref([]);
    const alreadySentChatIds = ref(<String[]>[]);

    onBeforeMount(() => {
        chats.value = props.data.map((item: Chat) => ({
            name: item.name,
            chatId: item.chatId,
            canWrite: false,
            isAlreadySent: false,
            loading: false,
        }));
    });

    const reset = () => {
        emit('update:modelValue', '');
        searchTerm.value = '';
    };

    const handleInput = evt => {
        emit('update:modelValue', evt.target.value);
    };

    const searchResults = computed(() =>
        chats.value.filter((item: Chat) => {
            return item.name.toLowerCase().includes(searchTerm.value.toLowerCase());
        })
    );

    async function shareFile(chatId) {
        const size = selectedPaths?.value[0]?.size ? selectedPaths?.value[0]?.size : props?.selectedFile?.size;
        const filename = selectedPaths?.value[0]?.fullName
            ? selectedPaths?.value[0]?.fullName
            : props?.selectedFile?.name;
        const chat = chats?.value.find(chat => chat?.chatId == chatId)
            ? chats?.value.find(chat => chat?.chatId == chatId)
            : chats?.value.find(chat => chat?.chatId == props.selectedFile?.id);
        const path = selectedPaths.value[0]?.path ? selectedPaths.value[0]?.path : props.selectedFile.path;
        chat.loading = true;
        await addShare(chatId, path, filename, size, chat.canWrite);
        chat.isAlreadySent = true;
        chat.loading = false;
        createNotification('Shared File', 'File has been shared with ' + chatId);
    }
</script>

<style scoped>
    .mh-48 {
        max-height: 10rem;
    }
</style>
