<template>
    <div class="px-2 py-2 w-full flex justify-start">
        <div class="flex xl:grid xl:grid-cols-2 w-full gap-y-2 items-center justify-around xl:justify-items-center">
            <div
                v-if="!blocked && !mobile"
                class="flex flex-col bg-white text-primary items-center px-2 justify-center w-24 h-16 rounded-lg border border-gray-300 cursor-pointer"
                @click="$emit('app-call')"
            >
                <span class="material-symbols-rounded"> videocam </span>
                <p class="text-xs mt-1">Video</p>
            </div>
            <div
                v-if="!chat.isGroup && !blocked"
                class="flex flex-col bg-white text-red-500 items-center px-2 justify-center w-24 h-16 rounded-lg border border-gray-300 cursor-pointer"
                @click="$emit('app-block')"
            >
                <span class="material-symbols-rounded"> block </span>
                <p class="text-xs mt-1">Block</p>
            </div>
            <div
                v-if="!chat.isGroup && blocked"
                class="flex flex-col bg-white text-red-500 items-center px-2 justify-center w-24 h-16 rounded-lg border border-gray-300 cursor-pointer"
                @click="$emit('app-unblock')"
            >
                <span class="material-symbols-rounded"> block</span>
                <p class="text-xs mt-1">Unblock</p>
            </div>

            <div
                class="delete flex flex-col bg-white text-red-500 items-center px-2 justify-center w-24 h-16 rounded-lg border border-gray-300 cursor-pointer"
                @click="$emit('app-leave')"
            >
                <span class="material-symbols-rounded"> {{ chat.isGroup ? 'logout' : 'delete' }} </span>
                <p class="text-xs mt-1">{{ chat.isGroup ? 'Leave' : 'Delete chat' }}</p>
            </div>

            <div
                v-if="!chat.isGroup"
                class="delete flex flex-col bg-white text-red-500 items-center px-2 justify-center w-24 h-16 rounded-lg border border-gray-300 cursor-pointer"
                @click="$emit('app-delete-user')"
            >
                <span class="material-symbols-rounded"> delete </span>
                <p class="text-xs mt-1">Delete user</p>
            </div>

            <div
                v-if="chat.isGroup && isAdmin"
                class="delete flex flex-col bg-white text-red-500 items-center px-2 justify-center w-24 h-16 rounded-lg border border-gray-300 cursor-pointer"
                @click="$emit('app-delete')"
            >
                <span class="material-symbols-rounded"> delete </span>
                <p class="text-xs mt-1">Delete</p>
            </div>
        </div>
    </div>
    <div v-if="chat.isGroup" class="m-2 border border-gray-300 bg-white relative rounded-lg md:grid grid-cols-1">
        <div class="flex justify-between items-center p-4">
            <h2 class="text-gray-800 font-medium text-left text-base">Members</h2>
            <UserAddIcon
                v-if="isAdmin || isModerator"
                class="text-gray-600 w-5 h-5 cursor-pointer hover:text-gray-800 transition duration-75"
                @click="openAddUserToGroup = true"
            />
        </div>
        <ul role="list" class="divide-y divide-gray-200 w-full border-t">
            <li
                v-for="contact in chat.contacts"
                :key="contact.id + chat.contacts.length"
                class="py-3 px-3 sm:px-4 grid grid-cols-2 items-center"
            >
                <div
                    @click="$emit('clickedProfile', contact)"
                    class="flex items-center justify-self-start overflow-hidden overflow-ellipsis cursor-pointer"
                >
                    <AvatarImg :id="contact.id" :contact="contact" small />
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900">{{ contact.id }}</p>
                    </div>
                </div>
                <div class="inline-flex items-center shadow-sm text-sm font-medium justify-self-end">
                    <button
                        v-if="isAdmin && chat.adminId !== contact.id && !contact.roles?.includes(Roles.MODERATOR)"
                        @click="changeUserRole(contact)"
                        class="border border-blue-500 px-3 py-2 mr-2 shadow-sm cursor-pointer rounded-md w-min"
                    >
                        <ChevronDoubleUpIcon class="h-4 w-4 text-blue-500" />
                    </button>
                    <button
                        v-if="isAdmin && chat.adminId !== contact.id && contact.roles?.includes(Roles.MODERATOR)"
                        @click="changeUserRole(contact)"
                        class="border border-yellow-500 px-3 py-2 mr-2 shadow-sm cursor-pointer rounded-md w-min"
                    >
                        <ChevronDoubleDownIcon class="h-4 w-4 text-yellow-500" />
                    </button>
                    <button
                        v-if="(isAdmin || isModerator) && user.id !== contact.id && contact.id !== chat.adminId"
                        @click="removeFromGroup(contact)"
                        class="border border-red-500 px-3 py-2 mr-2 cursor-pointer rounded-md w-min"
                    >
                        <TrashIcon class="h-4 w-4 text-red-500" />
                    </button>
                </div>
            </li>
        </ul>
    </div>
    <div v-if="sidebarFileList?.length !== 0" class="px-2">
        <h3 class="mt-2 ml-2 text-base text-left mb-4">Files</h3>
        <ul class="space-y-2 max-h-64 overflow-y-auto">
            <li
                class="flex items-center rounded justify-start w-full py-2 px-4 cursor-pointer hover:bg-gray-100 rounded transition duration-100"
                v-for="file in sidebarFileList"
            >
                <a :href="calcExternalResourceLink(file.body.url)" class="block outline-none border-none"
                    ><i :class="getIcon(false, getFileType(getExtension(file.body.filename)))" class="fa-lg"></i>
                    <span class="ml-2 font-normal text-gray-800" :title="moment(file.timeStamp).fromNow()">{{
                        truncate(file.body)
                    }}</span>
                </a>
            </li>
        </ul>
    </div>
    <div v-if="sidebarFileList?.length !== 0" id="spacer" class="bg-gray-100 h-2 w-full"></div>
    <!-- ADD USER TO GROUP MODAL -->
    <div
        v-if="(isAdmin || isModerator) && openAddUserToGroup"
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
                <div v-if="!unblockedMembers.length">
                    <p class="text-gray-400 text-center py-4 leading-7">
                        You don't have any contacts that are not already in the group. <br />
                        You can only add contacts from your connections list.
                    </p>
                </div>
                <div
                    v-for="(contact, i) in unblockedMembers"
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
            selectedUser = null;
        "
    >
        <template #title> Remove user</template>
        <template #content>
            Do you really want to remove <b>{{ selectedUser.id }}</b> from the group?
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
                    selectedUser = null;
                "
            >
                Cancel
            </button>
        </template>
    </Alert>

    <Alert
        v-if="showChangeUserRoleDialog"
        :showAlert="showChangeUserRoleDialog"
        type="info"
        @close="
            showChangeUserRoleDialog = false;
            selectedUser = null;
        "
    >
        <template #title v-if="selectedUser?.roles?.includes(Roles.MODERATOR)"> Demote user</template>
        <template #title v-else>You are about to promote {{ selectedUser.id }}</template>
        <template #content> By promoting this user will have more rights then others in this chat.</template>
        <template #actions>
            <button
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                @click="doChangeUserRole"
            >
                {{ selectedUser?.roles?.includes(Roles.MODERATOR) ? 'Demote ' : 'Promote ' }}user
            </button>
            <button
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                @click="
                    showChangeUserRoleDialog = false;
                    selectedUser = null;
                "
            >
                Cancel
            </button>
        </template>
    </Alert>
</template>
<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { usechatsActions } from '@/store/chatStore';
    import { useContactsState } from '@/store/contactStore';
    import { useAuthState } from '@/store/authStore';
    import { blocklist, getUnblockedContacts, userIsBlocked } from '@/store/blockStore';
    import { UserAddIcon, XIcon } from '@heroicons/vue/outline';
    import { ChevronDoubleDownIcon, ChevronDoubleUpIcon, TrashIcon } from '@heroicons/vue/solid';
    import { getFileType, getIcon, getExtension, isMobile } from '@/store/fileBrowserStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import moment from 'moment';
    import { Chat, Contact, GroupContact, MessageBodyType, MessageTypes, Roles, SystemMessageTypes } from '@/types';
    import Alert from '@/components/Alert.vue';
    import { useDebounceFn } from '@vueuse/core';

    const { updateContactsInGroup } = usechatsActions();
    const { user } = useAuthState();

    const mobile = ref(isMobile());

    interface IProps {
        chat: Chat;
    }

    const props = defineProps<IProps>();

    const sidebarFileList = computed(() => {
        return props.chat.messages.filter(msg => msg.type === MessageTypes.FILE);
    });

    const emit = defineEmits([
        'app-call',
        'app-block',
        'app-delete',
        'app-unblock',
        'app-leave',
        'app-delete-user',
        'clickedProfile',
    ]);

    const openAddUserToGroup = ref(false);

    const showRemoveUserDialog = ref(false);
    const showChangeUserRoleDialog = ref(false);
    const selectedUser = ref<GroupContact>();

    const truncate = (body: MessageBodyType) => {
        return body.filename?.length < 30
            ? body.filename
            : `${body?.filename?.slice(0, 15)}...${body?.filename?.slice(-15)}`;
    };

    const changeUserRole = (contact: GroupContact | Contact) => {
        if (!isGroupContact(contact)) return;

        showChangeUserRoleDialog.value = true;
        selectedUser.value = contact;
    };

    const isGroupContact = (contact: Contact): contact is GroupContact => {
        return !!(contact as GroupContact).roles;
    };

    const doChangeUserRole = () => {
        const isModerator = selectedUser.value.roles.includes(Roles.MODERATOR);

        if (isModerator) selectedUser.value.roles.pop();
        if (!isModerator) selectedUser.value.roles.push(Roles.MODERATOR);

        updateContactsInGroup(props.chat.chatId, selectedUser.value, SystemMessageTypes.CHANGE_USER_ROLE);
        showChangeUserRoleDialog.value = false;
        selectedUser.value = null;
    };

    const removeFromGroup = contact => {
        showRemoveUserDialog.value = true;
        selectedUser.value = contact;
    };

    const doRemoveFromGroup = () => {
        updateContactsInGroup(props.chat.chatId, selectedUser.value, SystemMessageTypes.REMOVE_USER);
        showRemoveUserDialog.value = false;
        selectedUser.value = null;
    };

    const addToGroup = useDebounceFn(async contact => {
        if (selectedUser.value?.id === contact.id) return;
        selectedUser.value = contact;
        await updateContactsInGroup(props.chat.chatId, contact, SystemMessageTypes.ADD_USER);
    }, 20);

    const isAdmin = computed(() => {
        return props.chat.adminId == user.id;
    });

    const isModerator = computed(() => {
        const contact = props.chat.contacts.find(c => c.id === user.id);
        if (!contact) return false;
        if ('roles' in contact) return contact.roles.includes(Roles.MODERATOR);
        return false;
    });

    const blocked = computed(() => {
        if (!props.chat || props.chat.isGroup) return false;
        return userIsBlocked(props.chat.chatId.toString());
    });

    const searchInput = ref('');

    const filteredMembers = computed(() => {
        const { groupContacts } = useContactsState();
        return groupContacts
            .filter(con => !props.chat.contacts.some(c => c.id === con.id))
            .filter(c => c.id.toLowerCase().includes(searchInput.value.toLowerCase()))
            .filter(c => !blocklist.value.includes(c.id.toString()));
    });

    const unblockedMembers = ref<GroupContact[]>(filteredMembers.value);

    const loadUnblocked = async () => {
        unblockedMembers.value = await getUnblockedContacts(filteredMembers.value, user.id.toString());
    };

    watch(filteredMembers, () => {
        loadUnblocked();
    });
</script>

<style scoped></style>
