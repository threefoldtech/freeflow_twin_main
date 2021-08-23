<template>
    <div class="place-items-start">
        <div class="grid grid-cols-2">
            <a
                :class="{ active: isActive('user') }"
                class="nav-link grid-cols-6 text-center py-2"
                href="#"
                @click.prevent="setActive('user')"
            >
                Add a user
            </a>
            <a
                :class="{ active: isActive('group') }"
                class="nav-link grid-cols-6 text-center py-2"
                href="#"
                @click.prevent="setActive('group')"
            >
                Create a group
            </a>
        </div>

        <form v-if="isActive('user')" class="w-full" @submit.prevent="contactAdd">
            <div class="flex flex-col">
                <user-table
                    v-model="usernameAdd"
                    :data="contacts"
                    :error="usernameAddError"
                    placeholder="Search for user..."
                    @clicked="handleClicked"
                ></user-table>
                <Disclosure v-slot="{ open }">
                    <DisclosureButton
                        class="
                            flex
                            justify-between
                            w-full
                            mt-4
                            ml-0
                            py-2
                            text-sm
                            font-medium
                            text-left text-gray-500
                            bg-gray-50
                            rounded-lg
                            hover:bg-gray-100
                            focus:outline-none
                            focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75
                        "
                    >
                        <span class="ml-6">Advanced</span>
                        <ChevronUpIcon :class="{ 'rotate-180': !open }" class="w-5 h-5 text-gray-500 transform mx-2" />
                    </DisclosureButton>
                    <DisclosurePanel class="px-4 pt-4 pb-2 text-sm text-gray-500">
                        <div>
                            <div>
                                <label for="manualContactAdd" class="block text-sm font-medium text-gray-700">Location</label>
                                <div>
                                    <input type="text" name="manualContactAdd" id="manualContactAdd" v-model="manualContactAdd" class="shadow-sm focus:ring-btngreen focus:border-btngreen block w-full sm:text-sm border-gray-300 rounded-md mt-1" placeholder="Location" />
                                </div>
                            </div>
                            <div class="w-full flex justify-end">
                                <input
                                    class="
                                        w-auto
                                        px-3
                                        py-2
                                        mt-2
                                        border
                                        cursor-pointer
                                        border-transparent
                                        text-sm
                                        leading-4
                                        font-medium
                                        rounded-md
                                        text-white
                                        bg-btngreen
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500
                                    "
                                    type="submit"
                                    value="Manually add"
                                />
                            </div>
                        </div>
                    </DisclosurePanel>
                </Disclosure>
            </div>
        </form>
        <form v-if="isActive('group')" class="w-full" @submit.prevent="groupAdd">
            <div class="flex place-items-center">
                <div class="w-full">
                    <div>
                        <label for="groupname" class="block text-sm font-medium text-gray-700">Group name</label>
                        <div>
                            <input type="text" name="groupname" id="groupname" v-model="groupnameAdd" class="shadow-sm focus:ring-btngreen focus:border-btngreen block w-full sm:text-sm border-gray-300 rounded-md mt-1" placeholder="Group name" />
                        </div>
                    </div>
                    <br />
                    <span v-if="groupnameAddError != ''" class="text-red-600">
                        {{ groupnameAddError }}
                    </span>
                </div>
            </div>
            <div>
                <user-table-group
                    v-model="usernameInGroupAdd"
                    :data="contacts"
                    :error="usernameAddError"
                    :usersInGroup="usersInGroup"
                    placeholder="Search for user..."
                ></user-table-group>
            </div>

            <div class="flex mt-4 justify-end w-full">
                <button
                    class="rounded-md border border-gray-400 px-4 py-2 justify-self-end"
                    @click="$emit('closeDialog')"
                >
                    Cancel
                </button>
                <button class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-btngreen">Add Group</button>
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
    import userTableGroup from '@/components/UserTableGroup.vue';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { ChevronUpIcon } from '@heroicons/vue/solid';

    export default defineComponent({
        name: 'ContactAdd',
        components: {
            AvatarImg,
            userTable,
            userTableGroup,
            Disclosure,
            DisclosureButton,
            DisclosurePanel,
            ChevronUpIcon,
        },
        emits: ['closeDialog'],
        setup(props, { emit }) {
            const { contacts } = useContactsState();
            //const contacts = [{"id":"jens", "location":"145.546.487"},{"id":"Simon", "location":"145.586.487"},{"id":"jonas", "location":"145.546.48765654654"},{"id":"Ine", "location":"145.546sdfsdf.487"}];
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
            let manualContactAdd = ref('');

            const contactAdd = () => {
                try {
                    let userId = usernameAdd.value;
                    if (!userId) {
                        usernameAddError.value = 'Cannot add empty user!';
                        return;
                    }

                    if (!manualContactAdd && !possibleUsers.value.find(pu => pu.id === userId)) {
                        usernameAddError.value = 'Not able to find DigitalTwin of this user';
                        return;
                    }
                    const { chats } = usechatsState();
                    if (chats.value.filter(chat => !chat.isGroup).find(chat => <string>chat.chatId == userId)) {
                        usernameAddError.value = 'Already added this user';
                        return;
                    }
                    const { addContact } = useContactsActions();
                    addContact(userId, manualContactAdd.value ? manualContactAdd.value : userAddLocation.value);
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
                manualContactAdd,
            };
        },
    });
</script>

<style scoped>
    a.active {
        background: #e5e7eb;
    }
</style>
