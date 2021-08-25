<template>
    <input
        v-model="searchTerm"
        @focus="handleInput"
        @input="handleInput"
        v-focus
        tabindex="0"
        maxlength="50"
        class="
            focus:ring-accent-500
            focus:border-accent-500
            block
            w-full
            sm:text-sm
            border border-gray-300
            rounded-md
            mb-2
            p-1
        "
        placeholder="Search"
    />

    <Table v-if="!isLoading" :headers="headers" :data="searchResults">
        <template #data-types="data">
            <div class="my-1 p-2 rounded-md border border-gray-200 w-20 ">
                <span v-if="canWrite(data.data)">Can write</span>
                <span v-else>Can read</span>
            </div>
            <!-- <div class="cursor-pointer rounded-xl bg-gray-50 border border-gray-200 w-28 justify-between flex content-center items-center ">
                <span @click="item.canWrite = false" class="p-2 rounded-xl" :class="{ 'bg-btngreen text-white': data.data.length <=1 }"> Read</span>
                <span @click="item.canWrite = true" class="p-2 rounded-xl" :class="{ 'bg-btngreen text-white': data.data.length > 1}"> Write</span>
            </div> -->
        </template>
        <template #data-delete>
            <span class="my-1 p-2 rounded-md bg-red-500 text-white">
                Remove
            </span>
        </template>
    </Table>
    <div v-else>loading</div>
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
import { getShareByPath } from '@/services/fileBrowserService';

const headers:IHeader<TEntry>[] = [
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
    components: { Toggle, AvatarImg, Table },
    props: {
        selectedFile: {
            type: Object,
            required: true,
        },
    },
    emits: ['update:modelValue', 'clicked'],

    setup(props, { emit }) {
        const searchTerm = ref('');
        const isLoading = ref(true);
        const currentShare = ref<SharedFileInterface>();

        onBeforeMount(async () => {
            currentShare.value = await getShareByPath(props.selectedFile.path);
            isLoading.value = false;
        });

        const reset = () => {
            emit('update:modelValue', '');
            searchTerm.value = '';
        };

        const handleInput = evt => {
            emit('update:modelValue', evt.target.value);
        };

        const searchResults = computed(() => {
            return currentShare.value.permissions.filter((item) => {
                return item.chatId.toLowerCase().includes(searchTerm.value.toLowerCase());
            });
        });

        const canWrite = computed ( () => {
            return (param) => {
                return !!param.find(perm => perm == 'w')
            }
        })

        return {
            reset,
            handleInput,
            searchTerm,
            searchResults,
            selectedPaths,
            headers,
            isLoading,
            canWrite,
        };
    },
});
</script>

<style scoped>
.mh-48 {
    max-height: 10rem;
}
</style>
