<template>
    <div v-if="chat.isGroup" class="bg-whitew-full relative rounded-lg mb-4 md:grid grid-cols-1">
        <div class="flex justify-between items-center mb-6 mt-4 mx-4">
            <h2 class="text-gray-800 font-medium text-left text-base">Members</h2>
            <UserAddIcon
                v-if="isAdmin"
                class="text-gray-600 w-5 h-5 cursor-pointer hover:text-gray-800 transition duration-75"
                @click="openAddUserToGroup = true"
            />
        </div>
        <div v-for="(contact, idx) in chat.contacts" :key="contact.id + chat.contacts.length" class="w-full">
            <div class="chatcard relative grid grid-cols-12 py-3">
                <div class="md:col-span-2 col-span-2 place-items-center grid relative">
                    <AvatarImg :id="contact.id" small />
                </div>
                <div class="md:col-span-8 col-span-8 pl-2">
                    <p class="flex place-content-between">
                        <span class="font-bold overflow-hidden overflow-ellipsis">
                            {{ contact.id }}
                        </span>
                    </p>
                </div>
                <div class="btns col-span-2">
                    <button v-if="isAdmin" @click="removeFromGroup(contact)">
                        <i class="fas fa-times text-red-500"></i>
                    </button>
                </div>
            </div>
        </div>
        <div id="spacer" class="bg-gray-100 h-2 w-full mt-6"></div>
    </div>
    <div class="bg-white p-2 w-full h-full flex flex-col justify-start">
        <h3 class="mt-2 ml-2 text-base text-left mb-4">Actions</h3>
        <div class="flex items-center flex-col w-full">
            <div class="call bg-gray-100 flex items-center rounded w-full m-2" @click="$emit('app-call')">
                <i class="fas fa-video m-3"></i>
                <p class="m-3 text-xs">Join video room</p>
            </div>
            <div
                v-if="!chat.isGroup && !blocked"
                class="block bg-gray-100 flex items-center rounded-xl w-full m-2"
                @click="$emit('app-block')"
            >
                <i class="fas fa-minus-circle m-3"></i>
                <p class="m-3 text-xs">Block user</p>
            </div>

            <div
                v-if="!chat.isGroup && blocked"
                class="block bg-gray-100 flex items-center rounded-xl w-full m-2"
                @click="$emit('app-unblock')"
            >
                <i class="fas fa-plus-circle m-3"></i>
                <p class="m-3 text-xs">Unblock user</p>
            </div>

            <div class="delete bg-gray-100 flex items-center rounded w-full m-2" @click="$emit('app-delete')">
                <i class="fas fa-trash m-3"></i>
                <p class="m-3 text-xs">Delete conversation</p>
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
                        class="
                            w-6
                            h-6
                            cursor-pointer
                            text-gray-500
                            hover:text-gray-600
                            transition
                            duration-75
                            absolute
                            right-2
                        "
                    />
                </div>
                <div class="mt-5 mb-2 border-2 py-1 px-2 flex justify-between items-center rounded-md relative w-full">
                    <input
                        class="
                            flex-grow
                            outline-none
                            ring-o
                            text-gray-600
                            focus:outline-none focus:ring-0 focus:text-gray-600
                            border-none
                            text-xs
                        "
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
                    <p class="text-gray-400 text-center py-4">Not able to add any contacts to this group</p>
                </div>
                <div
                    v-for="(contact, i) in filteredMembers"
                    :key="i"
                    class="grid grid-cols-12 py-2 w-full px-4"
                    :class="{ 'bg-gray-100': i % 2 === 0, 'bg-gray-50': i % 2 !== 0 }"
                >
                    <div class="col-span-2 place-items-center grid rounded-full border flex-shrink-0 w-10 h-10">
                        <AvatarImg :id="contact.id" small />
                    </div>
                    <p
                        class="
                            col-span-8
                            pl-4
                            flex-col
                            justify-center
                            overflow-hidden overflow-ellipsis
                            w-full
                            font-semibold
                        "
                    >
                        {{ contact.id }}
                    </p>
                    <div class="col-span-2 place-items-center grid">
                        <button class="h-12 rounded-full" @click="addToGroup(contact)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog
        v-model="showRemoveUserDialog"
        class="max-w-10"
        noActions
        @update-model-value="
            showRemoveUserDialog = false;
            toBeRemovedUser = null;
        "
    >
        <template v-slot:title class="center">
            <h1 class="text-center">Remove User</h1>
        </template>
        <div>
            Do you really want to Remove <b>{{ toBeRemovedUser.id }}</b> from the conversation?
        </div>
        <div class="flex justify-end mt-2">
            <button
                class="rounded-md border border-gray-400 px-4 py-2 justify-self-end"
                @click="
                    showRemoveUserDialog = false;
                    toBeRemovedUser = null;
                "
            >
                Cancel
            </button>
            <button class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-btnred" @click="doRemoveFromGroup">
                Remove
            </button>
        </div>
    </Dialog>
</template>
<script setup lang="ts">
    import { computed, ref, watch, onMounted } from 'vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { usechatsActions } from '../store/chatStore';
    import { useContactsState } from '../store/contactStore';
    import { useAuthState } from '../store/authStore';
    import { isBlocked } from '@/store/blockStore';
    import Dialog from '@/components/Dialog.vue';
    import { UserAddIcon, XIcon } from '@heroicons/vue/outline';

    interface IProps {
        chat: any;
    }

    const props = defineProps<IProps>();

    defineEmits(['app-call', 'app-block', 'app-delete', 'app-unblock']);

    const searchInput = ref<string>('');
    const openAddUserToGroup = ref<boolean>(false);

    const { contacts } = useContactsState();

    const filteredMembers = computed(() => {
        return contacts.filter(item => {
            return item.id.toLowerCase().includes(searchInput.value.toLowerCase());
        });
    });

    const showRemoveUserDialog = ref(false);
    const toBeRemovedUser = ref();

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
        updateContactsInGroup(props.chat.chatId, toBeRemovedUser.value, true);
        showRemoveUserDialog.value = false;
        toBeRemovedUser.value = null;
    };
    const addToGroup = contact => {
        const { updateContactsInGroup } = usechatsActions();
        //@ts-ignore
        updateContactsInGroup(props.chat.chatId, contact, false);
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
        return isBlocked(props.chat.chatId);
    });
</script>

<style scoped>
    .call,
    .block,
    .delete {
        border: 2px solid transparent;
    }

    .call:hover,
    .block:hover,
    .delete:hover {
        border: 2px solid black;
        cursor: pointer;
    }
</style>
