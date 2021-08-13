<template>
    <div class="place-items-start">
        <div class="grid grid-cols-2">
            <a
                class="nav-link grid-cols-6 text-center py-2"
                @click.prevent="setActive('user')"
                :class="{ active: isActive('user') }"
                href="#"
            >
                Add a user
            </a>
            <a
                class="nav-link grid-cols-6 text-center py-2"
                @click.prevent="setActive('group')"
                :class="{ active: isActive('group') }"
                href="#"
            >
                Create a group
            </a>
        </div>

        <form @submit.prevent="contactAdd" class="w-full" v-if="isActive('user')">
            <div class="flex flex-col">
                <user-table
                    :data="contacts"
                    v-model="usernameAdd"
                    placeholder="Search for user..."
                    :error="usernameAddError"
                    @clicked="handleClicked"
                ></user-table>
            </div>
        </form>
        <form @submit.prevent="groupAdd" class="w-full" v-if="isActive('group')">
            <div class="flex place-items-center">
                <label class="mr-2" for="username">Group name: </label>
                <div class="w-full">
                    <input v-model="groupnameAdd" id="username" class="mb-2" placeholder="Group name" maxlength="50"/>
                    <br />
                    <span class="text-red-600" v-if="groupnameAddError != ''">
                        {{ groupnameAddError }}
                    </span>
                </div>
            </div>
            <div>
                <user-table-group
                    :data="contacts"
                    :usersInGroup="usersInGroup"
                    v-model="usernameInGroupAdd"
                    placeholder="Search for user..."
                    :error="usernameAddError"
                ></user-table-group>
            </div>
            <div class="flex mt-4 justify-end w-full">
                <button @click="$emit('closeDialog')" class="rounded-md border border-gray-400 px-4 py-2 justify-self-end">Cancel</button>
                <button style="backgroundColor: #16A085" class="py-2 px-4 text-white rounded-md justify-self-end">Add Group</button>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
    import { selectedId, usechatsActions, usechatsState } from '@/store/chatStore';
    import { defineComponent, ref, computed, nextTick, watch } from 'vue';
    import { useContactsActions, useContactsState } from '../store/contactStore';
    import { useAuthState, myYggdrasilAddress } from '../store/authStore';
    import { Chat, Contact, Message } from '../types/index';
    import axios from 'axios';
    import config from '../../public/config/config';
    import { uuidv4 } from '@/common';
    import AvatarImg from '@/components/AvatarImg.vue';
    import userTable from '@/components/UserTable.vue';
    import userTableGroup from '@/components/UserTableGroup.vue'

    export default defineComponent({
        name: 'ContactAdd',
        components: { AvatarImg, userTable, userTableGroup },
        emits: ['closeDialog'],
        setup(props, { emit }) {
            const { contacts } = useContactsState();
            let addGroup = ref(false);
            let usernameAdd = ref('');
            let userAddLocation = ref('');
            let usernameAddError = ref('');
            let groupnameAdd = ref('');
            let groupnameAddError = ref('');
            let usernameInGroupAdd = ref('');
            let usersInGroup = ref<Contact[]>([]);
            let possibleUsers = ref<Contact[]>([]);
            let contactAddError = ref('');

            const contactAdd = () => {
                try {
                    let userId = usernameAdd.value;
                    if(!userId) {
                        usernameAddError.value = 'Cannot add empty user!';
                        return;
                    }
                    if (!possibleUsers.value.find(pu => pu.id === userId)) {
                        usernameAddError.value = 'Not able to find DigitalTwin of this user';
                        return;
                    }
                    const { chats } = usechatsState();
                    if (chats.value.filter(chat => !chat.isGroup).find(chat => <string>chat.chatId == userId)) {
                        usernameAddError.value = 'Already added this user';
                        return;
                    }
                    const { addContact } = useContactsActions();
                    addContact(userId, userAddLocation.value);
                    usernameAdd.value = '';
                    contactAddError.value = '';
                    emit('closeDialog');

                    //@todo: setTimeout is dirty should be removed
                    // next tick was not possible reason: chat was not loaded yet
                    setTimeout(() => {
                        selectedId.value = userId;
                    }, 1000);
                } catch (err) {
                    console.log('adding contact failed');
                    contactAddError.value = err;
                }
            };

            const handleClicked = () => {
                const posUser = possibleUsers.value.find(pu => pu.id == usernameAdd.value);
                if (posUser) {
                    userAddLocation.value = posUser.location;
                }
            };

            let activeItem = ref('user');
            const isActive = menuItem => {
                return activeItem.value === menuItem;
            };

            const setActive = menuItem => {
                activeItem.value = menuItem;
                groupnameAddError.value = '';
                usernameAddError.value = '';
            };

            const groupAdd = async () => {
                const { addGroupchat } = usechatsActions();
                const { user } = useAuthState();
                const { chats } = usechatsState();
                if (groupnameAdd.value == '') {
                    groupnameAddError.value = 'Please enter a group name';
                    return;
                }
                if (groupnameAdd.value.length > 20) {
                    groupnameAddError.value = "The name can't contain more than 20 characters";
                    return;
                }
                const mylocation = await myYggdrasilAddress();
                usersInGroup.value.push({
                    id: user.id,
                    location: mylocation,
                });

                addGroupchat(groupnameAdd.value, usersInGroup.value);
                //@todo: setTimeout is dirty should be removed
                // next tick was not possible reason: chat was not loaded yet
                setTimeout(() => {
                    selectedId.value = groupnameAdd.value;
                }, 1000);
                usersInGroup.value = [];
                emit('closeDialog');
            };

            // @todo: config
            axios.get(`${config.spawnerUrl}api/v1/list`, {}).then(r => {
                const { user } = useAuthState();
                const posContacts = <Contact[]>r.data;
                possibleUsers.value = posContacts.filter(pu => pu.id !== user.id);
            });

            return {
                addGroup,
                usernameAdd,
                usernameAddError,
                groupnameAdd,
                groupnameAddError,
                usernameInGroupAdd,
                userAddLocation,
                contactAdd,
                usersInGroup,
                isActive,
                setActive,
                groupAdd,
                contacts,
                possibleUsers,
                handleClicked,
            };
        },
    });
</script>

<style scoped>
    a.active {
        background: #e5e7eb;
    }
</style>
