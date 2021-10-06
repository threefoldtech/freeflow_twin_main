<template>
    <div class="my-2 relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
            type="text"
            @focus="handleInput"
            @input="handleInput"
            v-model="searchTerm"
            class="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search"
        />
    </div>
    <Table v-if="searchResults?.length > 0" :headers="headers" :data="searchResults">
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
<script lang="ts">
import { Chat, SharedFileInterface } from '@/types';
import { selectedPaths, addShare } from '@/store/fileBrowserStore';
import { defineComponent, ref, computed, onMounted, onBeforeMount } from 'vue';
import Toggle from '@/components/Toggle.vue';
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
import { sendMessageObject, usechatsActions, usechatsState } from '@/store/chatStore';
import AvatarImg from '@/components/AvatarImg.vue';
import { SystemMessageTypes, MessageTypes } from '@/types';
const { sendMessage } = usechatsActions();
import { createNotification } from '@/store/notificiationStore';
import { Table, IHeader, TEntry } from '@jimber/shared-components';
import { isObject } from 'lodash';
import { getShareByPath, removeFilePermissions } from '@/services/fileBrowserService';
import { SearchIcon } from '@heroicons/vue/solid';
import { useRoute } from 'vue-router';

const headers: IHeader<TEntry>[] = [
    {
        key: 'chatId',
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

export default defineComponent({
    components: { SearchIcon, Toggle, AvatarImg, Table },
    props: {
        selectedFile: {
            type: Object,
            required: true,
        },
    },
    emits: ['update:modelValue', 'clicked'],

    setup(props, { emit }) {
        const searchTerm = ref('');
        const currentShare = ref<SharedFileInterface>();

        onBeforeMount(async () => {
            currentShare.value = await getShareByPath(props.selectedFile.path);
        });

        const reset = () => {
            emit('update:modelValue', '');
            searchTerm.value = '';
        };

        const handleInput = evt => {
            emit('update:modelValue', evt.target.value);
        };

        const searchResults = computed(() => {
            return currentShare.value?.permissions?.filter(item => {
                return item.chatId.toLowerCase().includes(searchTerm.value.toLowerCase());
            });
        });

        const canWrite = computed(() => {
            return param => {
                return !!param.find(perm => perm == 'w');
            };
        });

        const remove = async (data: any) => {
            removeFilePermissions(data.chatId, props.selectedFile.path);
            currentShare.value = await getShareByPath(props.selectedFile.path);
        };

        return {
            reset,
            handleInput,
            searchTerm,
            searchResults,
            selectedPaths,
            headers,
            canWrite,
            remove,
        };
    },
});
</script>

<style scoped>
.mh-48 {
    max-height: 10rem;
}
</style>
