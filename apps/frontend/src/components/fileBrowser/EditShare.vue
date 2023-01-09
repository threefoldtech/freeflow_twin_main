<template>
    <div class="my-2 mx-4 relative rounded-md shadow-sm">
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
                <span v-if="canWrite(data.row)">Write</span>
                <span v-else>Read</span>
            </div>
        </template>
        <template #data-delete="data">
            <span class="my-1 p-2 rounded-md bg-red-500 text-white cursor-pointer" @click="remove(data.row)">
                Remove
            </span>
        </template>
    </Table>
    <div v-else class="flex justify-center itemns-center mt-2">This file isn't shared with anyone yet.</div>
</template>
<script lang="ts" setup>
    import { SharedFileInterface, SharePermissionInterface } from '@/types';
    import { PathInfoModel } from '@/store/fileBrowserStore';
    import { ref, computed, onBeforeMount } from 'vue';
    import { useChatsState } from '@/store/chatStore';
    import { Table, IHeader, TEntry } from '@jimber/shared-components';
    import { getShareByPath, removeFilePermissions } from '@/services/fileBrowserService';
    import { SharePermission } from '@/types';
    import { SearchIcon } from '@heroicons/vue/solid';

    const { chats } = useChatsState();
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
        selectedFile: SharedFileInterface;
    }

    const props = defineProps<IProps>();
    const emit = defineEmits(['update:modelValue', 'clicked']);
    const currentShare = ref<SharedFileInterface>();

    onBeforeMount(async () => {
        await renderPermissionsData();
    });

    const renderPermissionsData = async () => {
        currentShare.value = await getShareByPath(props.selectedFile.path);
        if (!currentShare.value) return;
        currentShare.value.permissions = currentShare.value?.permissions?.map(item => {
            const chat = chats.value.find(chat => {
                return chat.chatId === item.userId;
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
                name: item.userId,
            };
        });
    };

    const handleInput = evt => {
        emit('update:modelValue', evt.target.value);
    };

    const canWrite = (data: SharePermissionInterface) => {
        return data.sharePermissionTypes.includes(SharePermission.Write);
    };

    const searchTerm = ref('');

    const searchResults = computed(() => {
        return currentShare?.value?.permissions?.filter(item => {
            return item?.name?.toLowerCase().includes(searchTerm.value.toLowerCase());
        });
    });

    const remove = async (data: any) => {
        const chat = chats.value.find(c => c.chatId === data.userId);
        if (!chat) return;
        let contact = chat.contacts.find(con => con.id === chat.chatId);
        if (chat.isGroup) contact = chat.contacts.find(c => c.id === chat.adminId);
        if (!contact) return;

        await removeFilePermissions(data.userId, props.selectedFile.path, contact.location);
        await renderPermissionsData();
    };
</script>

<style scoped></style>
