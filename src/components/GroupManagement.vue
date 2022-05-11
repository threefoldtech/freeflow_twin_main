<template>
    <div v-if="chat.isGroup" class="bg-white w-full relative rounded-lg md:grid grid-cols-1">
        <div class="flex justify-between items-center mb-6 mt-4 mx-4">
            <h2 class="text-gray-800 font-medium text-left text-base">Members</h2>
            <UserAddIcon
                v-if="isAdmin"
                class="text-gray-600 w-5 h-5 cursor-pointer hover:text-gray-800 transition duration-75"
                @click="openAddUserToGroup = true"
            />
        </div>
        <ul role="list" class="divide-y divide-gray-200 w-full border-t">
            <li
                v-for="(contact, idx) in chat.contacts"
                :key="contact.id + chat.contacts.length"
                class="py-3 px-4 sm:px-6 grid grid-cols-2 items-center"
            >
                <div class="flex items-center justify-self-start overflow-hidden overflow-ellipsis">
                    <AvatarImg :id="contact.id" small />
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900">{{ contact.id }}</p>
                    </div>
                </div>
                <button
                    v-if="isAdmin && chat.adminId !== contact.id"
                    @click="removeFromGroup(contact)"
                    class="inline-flex items-center border border-red-500 px-3 py-2 shadow-sm text-sm font-medium cursor-pointer rounded-md w-min justify-self-end"
                >
                    <TrashIcon class="h-4 w-4 text-red-500" />
                </button>
            </li>
        </ul>
        <div id="spacer" class="bg-gray-100 h-2 w-full mt-2"></div>
    </div>
    <div v-if="sidebarFileList?.length !== 0" class="px-2">
        <h3 class="mt-2 ml-2 text-base text-left mb-4">Files</h3>
        <ul class="space-y-2 max-h-64 overflow-y-auto">
            <li
                class="flex items-center rounded justify-start w-full py-2 px-4 cursor-pointer hover:bg-gray-100 rounded transition duration-100"
                v-for="file in sidebarFileList"
            >
                <a :href="calcExternalResourceLink(file.body.url)" class="block outline-none border-none"
                    ><i :class="getIconDirty(false, getFileType(file.fileType))" class="fa-lg"></i>
                    <span class="ml-2 font-normal text-gray-800" :title="moment(file.timeStamp).fromNow()">{{
                        truncate(file)
                    }}</span>
                </a>
            </li>
        </ul>
    </div>
    <div v-if="sidebarFileList?.length !== 0" id="spacer" class="bg-gray-100 h-2 w-full"></div>
    <div class="bg-white p-2 w-full h-full flex flex-col justify-start">
        <h3 class="mt-2 ml-2 text-base text-left mb-4">Actions</h3>
        <div class="flex items-center flex-col w-full">
            <div
                class="call bg-gray-100 flex items-center rounded w-full m-2 cursor-pointer"
                @click="$emit('app-call')"
            >
                <i class="fas fa-video m-3"></i>
                <p class="m-3 text-xs">Join video room</p>
            </div>
            <div
                v-if="!chat.isGroup && !blocked"
                class="block bg-gray-100 flex items-center rounded w-full m-2 cursor-pointer"
                @click="$emit('app-block')"
            >
                <i class="fas fa-minus-circle m-3"></i>
                <p class="m-3 text-xs">Block user</p>
            </div>

            <div
                v-if="!chat.isGroup && blocked"
                class="block bg-gray-100 flex items-center rounded w-full m-2 cursor-pointer"
                @click="$emit('app-unblock')"
            >
                <i class="fas fa-plus-circle m-3"></i>
                <p class="m-3 text-xs">Unblock user</p>
            </div>

            <div
                class="delete bg-gray-100 flex items-center rounded w-full m-2 cursor-pointer"
                @click="$emit('app-leave')"
            >
                <i class="fas fa-trash m-3"></i>
                <p class="m-3 text-xs">{{ chat.isGroup ? 'Leave group' : 'Delete user' }}</p>
            </div>

            <div
                v-if="isAdmin"
                class="delete bg-red-100 flex items-center rounded w-full m-2 cursor-pointer"
                @click="$emit('app-delete')"
            >
                <i class="fas fa-trash m-3"></i>
                <p class="m-3 text-xs">Delete group</p>
            </div>
        </div>
        <div class="flex-grow-0 w-full h-full"></div>
    </div>
    <!-- ADD USER TO GROUP MODAL -->
    <div
        v-if="isAdmin && openAddUserToGroup"
        @click="openAddUserToGroup = false"
        class="w-full h-full inset-0 absolute bg-black bg-opacity-25 z-50 flex justify-center items-center"
    >
        <div
            @click.stop
            class="w-full bg-white w-full h-full md:h-3/5 md:w-5/6 lg:md:w-3/6 xl:w-4/6 2xl:w-2/6 overflow-auto"
        >
            <div class="sticky top-0 z-50 bg-white p-4 pb-0">
                <div class="flex items-center relative">
                    <h2 class="text-gray-800 text-lg font-medium text-left">Add new members to the group</h2>
                    <XIcon
                        @click="openAddUserToGroup = false"
                        class="w-6 h-6 cursor-pointer text-gray-500 hover:text-gray-600 transition duration-75 absolute right-2"
                    />
                </div>
                <div class="mt-5 mb-2 border-2 py-1 px-2 flex justify-between items-center rounded-md relative w-full">
                    <input
                        class="flex-grow outline-none ring-o text-gray-600 focus:outline-none focus:ring-0 focus:text-gray-600 border-none text-xs"
                        type="text"
                        placeholder="Search users..."
                        v-model="searchInput"
                    />
                    <XIcon
                        :class="[{ 'text-gray-400': searchInput.length >= 1, 'text-gray-200': searchInput.length < 1 }]"
                        class="w-6 h-6 cursor-pointer hover:text-gray-400 transition duration-100"
                        @click="searchInput = ''"
                    />
                </div>
            </div>
            <div class="flex flex-col relative max-h-82 p-4">
                <div v-if="!filteredMembers.length">
                    <p class="text-gray-400 text-center py-4 leading-7">
                        You don't have any contacts that are not already in the group. <br />
                        You can only add contacts from your connections list.
                    </p>
                </div>
                <div
                    v-for="(contact, i) in filteredMembers"
                    :key="i"
                    @click="addToGroup(contact)"
                    class="grid grid-cols-12 py-4 mb-4 w-full hover:bg-gray-200 cursor-pointer"
                    :class="{ 'bg-gray-100': i % 2 === 0, 'bg-gray-50': i % 2 !== 0 }"
                >
                    <div class="col-span-2 place-items-center grid rounded-full flex-shrink-0">
                        <AvatarImg :id="contact.id" small />
                    </div>
                    <p
                        class="col-span-8 pl-4 flex-col flex justify-center overflow-hidden overflow-ellipsis w-full font-semibold"
                    >
                        {{ contact.id }}
                    </p>
                    <div class="col-span-2 place-items-center grid">
                        <button class="rounded-full">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Alert
        v-if="showRemoveUserDialog"
        :showAlert="showRemoveUserDialog"
        @close="
            showRemoveUserDialog = false;
            toBeRemovedUser = null;
        "
    >
        <template #title> Remove user </template>
        <template #content>
            Do you really want to remove <b>{{ toBeRemovedUser.id }}</b> from the group?
        </template>
        <template #actions>
            <button
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                @click="doRemoveFromGroup"
            >
                Remove
            </button>
            <button
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                @click="
                    showRemoveUserDialog = false;
                    toBeRemovedUser = null;
                "
            >
                Cancel
            </button>
        </template>
    </Alert>
</template>
<script setup lang="ts">
    import { computed, onMounted, ref } from 'vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { usechatsActions } from '../store/chatStore';
    import { useContactsState } from '../store/contactStore';
    import { useAuthState } from '../store/authStore';
    import { isBlocked } from '@/store/blockStore';
    import { UserAddIcon, XIcon } from '@heroicons/vue/outline';
    import { TrashIcon } from '@heroicons/vue/solid';
    import { getFileType, getIconDirty } from '@/store/fileBrowserStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import moment from 'moment';
    import { Chat, MessageTypes, SystemMessageTypes } from '@/types';
    import Alert from '@/components/Alert.vue';

    interface IProps {
        chat: Chat;
    }

    const props = defineProps<IProps>();

    const sidebarFileList = computed(() => {
        const files = props.chat.messages.filter(msg => msg.type === MessageTypes.FILE);
        files.map(file => {
            const url = file.body.url;
            file.body.url = url;
        });
        return files;
    });

    defineEmits(['app-call', 'app-block', 'app-delete', 'app-unblock', 'app-leave']);

    const searchInput = ref<string>('');
    const openAddUserToGroup = ref<boolean>(false);

    const { contacts } = useContactsState();

    const filteredMembers = computed(() => {
        return contacts
            .filter(con => !props.chat.contacts.some(c => c.id === con.id))
            .filter(c => c.id.toLowerCase().includes(searchInput.value.toLowerCase()));
    });

    const showRemoveUserDialog = ref(false);
    const toBeRemovedUser = ref();

    const truncate = ({ body, extension }) => {
        return body.filename?.length < 30
            ? body.filename
            : `${body?.filename?.slice(0, 15)}...${body?.filename?.slice(-15)}`;
    };

    onMounted(() => {
        //Calculating already existent objects
        const computed = contacts.map(contact => {
            for (const i of props.chat.contacts) {
                if (contact.id === i.id && contact.location === i.location) {
                    return contact;
                }
            }
        });
    });

    const removeFromGroup = contact => {
        showRemoveUserDialog.value = true;
        toBeRemovedUser.value = contact;
    };
    const doRemoveFromGroup = () => {
        const { updateContactsInGroup } = usechatsActions();
        updateContactsInGroup(props.chat.chatId, toBeRemovedUser.value, SystemMessageTypes.REMOVE_USER);
        showRemoveUserDialog.value = false;
        toBeRemovedUser.value = null;
    };
    const addToGroup = contact => {
        const { updateContactsInGroup } = usechatsActions();
        //@ts-ignore
        updateContactsInGroup(props.chat.chatId, contact, SystemMessageTypes.ADD_USER);
    };
    const filteredContacts = computed(() => {
        return contacts.filter(
            //@ts-ignore
            c => !props.chat.contacts.map(x => x.id).includes(c.id)
        );
    });

    const isAdmin = computed(() => {
        const { user } = useAuthState();
        //@ts-ignore
        return props.chat.adminId == user.id;
    });

    const blocked = computed(() => {
        if (!props.chat || props.chat.isGroup) return false;
        return isBlocked(props.chat.chatId.toString());
    });
</script>

<style scoped></style>
