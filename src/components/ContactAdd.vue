<template>
    <div class="place-items-start">
        <div class="grid grid-cols-2">
            <a
                v-for="item in navigation"
                :key="item.name"
                :class="[
                    activeItem === item.name
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-black hover:bg-gray-200 transition duration-300',
                ]"
                class="nav-link grid-cols-6 text-center py-2 rounded-xl font-normal"
                href="#"
                @click.prevent="setActive(item.name)"
            >
                {{ item.text }}
            </a>
        </div>
        <div v-if="isActive('user')" class="flex flex-col">
            <UserTable
                :data="possibleUsers"
                focus
                placeholder="Search for user..."
                @addContact="contactAdd"
            ></UserTable>
            <Disclosure v-slot="{ open }">
                <DisclosureButton
                    class="flex justify-between w-full mt-4 ml-0 py-2 text-sm font-medium text-left text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
                >
                    <span class="ml-6">Advanced</span>

                    <ChevronUpIcon :class="{ 'rotate-180': !open }" class="w-5 h-5 text-gray-500 transform mx-2" />
                </DisclosureButton>
                <DisclosurePanel class="px-4 pt-4 pb-2 text-sm text-gray-500">
                    <div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700" for="manualContactAddUsername"
                                >Name</label
                            >
                            <div class="relative">
                                <input
                                    id="manualContactAddUsername"
                                    v-model="manualContactAddUsername"
                                    class="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md mt-1"
                                    name="manualContactAddUsername"
                                    placeholder="Username"
                                    type="text"
                                />
                                <div
                                    v-if="!!manualContactAddUsername"
                                    @click="manualContactAddUsername = ''"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                >
                                    <i class="fa fa-window-close h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <span class="text-red-600" v-if="usernameAddError != ''"> {{ usernameAddError }} </span>
                            </div>
                            <label class="block text-sm font-medium text-gray-700" for="manualContactAddLocation"
                                >Location</label
                            >
                            <div class="relative">
                                <input
                                    id="manualContactAddLocation"
                                    v-model="manualContactAddLocation"
                                    class="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md mt-1"
                                    name="manualContactAddLocation"
                                    placeholder="Location"
                                    type="text"
                                />
                                <div
                                    v-if="!!manualContactAddLocation"
                                    @click="manualContactAddLocation = ''"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                >
                                    <i class="fa fa-window-close h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                        <div class="w-full flex justify-end">
                            <button
                                class="w-auto px-3 py-2 mt-2 border cursor-pointer border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                                value=""
                                @click="contactAdd"
                            >
                                Manually add
                            </button>
                        </div>
                    </div>
                </DisclosurePanel>
            </Disclosure>
        </div>
        <form v-if="isActive('group')" class="w-full h-3/5 overflow-x-hidden" @submit.prevent="groupAdd">
            <div class="flex place-items-center mx-1 mb-4">
                <div class="w-full">
                    <br />
                    <span v-if="groupnameAddError !== ''" class="text-red-600">
                        {{ groupnameAddError }}
                    </span>
                    <div>
                        <label for="groupname" class="block text-sm font-medium text-gray-700">Group name</label>
                        <div class="relative">
                            <input
                                id="groupname"
                                v-model="groupnameAdd"
                                v-focus
                                class="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md mt-1"
                                name="groupname"
                                placeholder="Group name"
                                type="text"
                            />
                            <div
                                v-if="!!groupnameAdd"
                                @click="groupnameAdd = ''"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            >
                                <i class="fa fa-window-close h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <UserTableGroup
                    v-model="usernameInGroupAdd"
                    :data="contacts"
                    :error="usernameAddError"
                    :usersInGroup="usersInGroup"
                    placeholder="Search for user..."
                ></UserTableGroup>
            </div>

            <div class="flex mt-4 justify-end w-full">
                <button
                    class="rounded-md border border-gray-400 px-4 py-2 justify-self-end transition hover:bg-gray-50"
                    @click="$emit('closeDialog')"
                >
                    Cancel
                </button>
                <button
                    class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-primary hover:bg-accent-700 transition duration-300"
                >
                    Add Group
                </button>
            </div>
        </form>
    </div>
</template>

<script lang="ts" setup>
    import { selectedId, usechatsActions, useChatsState } from '@/store/chatStore';
    import { ref } from 'vue';
    import { useContactsActions, useContactsState } from '../store/contactStore';
    import { useAuthState, myYggdrasilAddress } from '../store/authStore';
    import { Contact } from '../types/index';
    import axios from 'axios';
    import config from '@/config';
    import UserTable from '@/components/UserTable.vue';
    import UserTableGroup from '@/components/UserTableGroup.vue';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { ChevronUpIcon } from '@heroicons/vue/solid';

    const emit = defineEmits(['closeDialog']);
    const { contacts } = useContactsState();
    //const contacts = [{"id":"jens", "location":"145.546.487"},{"id":"Simon", "location":"145.586.487"},{"id":"jonas", "location":"145.546.48765654654"},{"id":"Ine", "location":"145.546sdfsdf.487"}];
    const userAddLocation = ref('');
    const usernameAddError = ref('');
    const groupnameAdd = ref('');
    const groupnameAddError = ref('');
    const usernameInGroupAdd = ref('');
    const usersInGroup = ref<Contact[]>([]);
    const possibleUsers = ref<Contact[]>([]);
    const contactAddError = ref('');

    const manualContactAddUsername = ref<string>('');
    const manualContactAddLocation = ref('');

    const navigation = ref([
        { name: 'user', text: 'Add a user' },
        { name: 'group', text: 'Create a group' },
    ]);

    const contactAdd = (contact: Contact) => {
        const contactToAdd: Contact = {
            id: contact?.id ? contact.id : manualContactAddUsername.value,
            location: contact?.location ? contact.location : manualContactAddLocation.value,
        };
        const { chats } = useChatsState();
        try {
            if (chats.value.filter(chat => !chat.isGroup).find(chat => <string>chat.chatId == contactToAdd.id)) {
                usernameAddError.value = 'Already added this user';
                return;
            }
            const { addContact } = useContactsActions();
            addContact(contactToAdd.id, contactToAdd.location);
            manualContactAddUsername.value = undefined;
            contactAddError.value = '';
            emit('closeDialog');

            //@todo: setTimeout is dirty should be removed
            // next tick was not possible reason: chat was not loaded yet
            setTimeout(() => {
                selectedId.value = <string>contactToAdd.id;
            }, 1000);
        } catch (err) {
            console.log('adding contact failed');
            contactAddError.value = err;
        }
    };

    const handleClicked = (item: { location: string }) => {
        userAddLocation.value = item.location;
    };

    const activeItem = ref('user');

    const isActive = (menuItem: string) => {
        return activeItem.value === menuItem;
    };

    const setActive = (menuItem: string) => {
        activeItem.value = menuItem;
        groupnameAddError.value = '';
        usernameAddError.value = '';
    };

    const groupAdd = async () => {
        const { addGroupchat } = usechatsActions();
        const { user } = useAuthState();
        const format = /[`!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/;

        if (groupnameAdd.value == '') {
            groupnameAddError.value = 'Please enter a group name';
            return;
        }
        if (format.test(groupnameAdd.value)) {
            groupnameAddError.value = 'No special characters allowed in group names.';
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
    axios.get(`${config.appBackend}api/users/digitaltwin`, {}).then(r => {
        const { user } = useAuthState();
        const posContacts = <Contact[]>r.data;
        const alreadyExistingChatIds = [...contacts.map(c => c.id), user.id];
        possibleUsers.value = posContacts.filter(pu => !alreadyExistingChatIds.find(aEx => aEx === pu.id));
    });
</script>

<style scoped></style>
