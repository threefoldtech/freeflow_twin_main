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
    <Table v-if="searchResults?.length > 0" :data="searchResults" :headers="headers">
        <template #data-types="data">
            <div class="my-1 p-2 rounded-md border border-gray-200 w-20">
                <span v-if="canWrite(data.data)">Write</span>
                <span v-else>Read</span>
            </div>
            <!-- <div class="cursor-pointer rounded-xl bg-gray-50 border border-gray-200 w-28 justify-between flex content-center items-center ">
                <span @click="item.canWrite = false" class="p-2 rounded-xl" :class="{ 'bg-primary text-white': data.data.length <=1 }"> Read</span>
                <span @click="item.canWrite = true" class="p-2 rounded-xl" :class="{ 'bg-primary text-white': data.data.length > 1}"> Write</span>
            </div> -->
        </template>
        <template #data-delete="data">
            <span class="my-1 p-2 rounded-md bg-red-500 text-white" @click="remove(data.row)"> Remove </span>
        </template>
    </Table>
    <div v-else class="flex justify-center itemns-center mt-2">This file isn't shared with anyone yet.</div>
</template>
<script lang="ts" setup>
    import { Chat, SharedFileInterface } from '@/types';
    import { selectedPaths, addShare, PathInfoModel } from '@/store/fileBrowserStore';
    import { defineComponent, ref, computed, onMounted, onBeforeMount } from 'vue';
    import Toggle from '@/components/Toggle.vue';
    import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
    import { sendMessageObject, usechatsActions, useChatsState } from '@/store/chatStore';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { SystemMessageTypes, MessageTypes } from '@/types';

    const { sendMessage } = usechatsActions();
    const { chats } = useChatsState();
    import { createNotification } from '@/store/notificiationStore';
    import { Table, IHeader, TEntry } from '@jimber/shared-components';
    import { isObject } from 'lodash';
    import { getShareByPath, removeFilePermissions } from '@/services/fileBrowserService';
    import { SearchIcon } from '@heroicons/vue/solid';
    import { useRoute } from 'vue-router';

    const headers: IHeader<TEntry>[] = [
        {
            key: 'name',
            displayName: 'Chat',
            enableSorting: true,
        },
        {
            key: 'types',
            displayName: 'Permission',
        },
        {
            key: 'delete',
            displayName: 'Delete',
        },
    ];

    interface IProps {
        selectedFile: PathInfoModel;
    }

    const emit = defineEmits(['update:modelValue', 'clicked']);
    const props = defineProps<IProps>();
    const searchTerm = ref('');
    const currentShare = ref<SharedFileInterface>();

    onBeforeMount(async () => {
        await renderPermissionsData();
    });

    const renderPermissionsData = async () => {
        currentShare.value = await getShareByPath(props.selectedFile.path);
        currentShare.value.permissions = currentShare.value?.permissions?.map(item => {
            const chat = chats.value.find(chat => {
                return chat.chatId === item.chatId;
            });
            if (chat.isGroup) {
                //Groups chatId's are UUID
                return {
                    ...item,
                    name: chat.name,
                };
            }
            return {
                ...item,
                name: item.chatId,
            };
        });
    };

    const reset = () => {
        emit('update:modelValue', '');
        searchTerm.value = '';
    };

    const handleInput = evt => {
        emit('update:modelValue', evt.target.value);
    };

    const searchResults = computed(() => {
        return currentShare?.value?.permissions?.filter(item => {
            return item?.name?.toLowerCase().includes(searchTerm.value.toLowerCase());
        });
    });

    const canWrite = computed(() => {
        return param => {
            return !!param.find(perm => perm == 'w');
        };
    });

    const remove = async (data: any) => {
        removeFilePermissions(data.chatId, props.selectedFile.path, props.selectedFile.location);
        renderPermissionsData();
    };
</script>

<style scoped>
    .mh-48 {
        max-height: 10rem;
    }
</style>
