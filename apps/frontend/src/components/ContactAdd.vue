<template>
    <div class="place-items-start">
        <div class="grid grid-cols-2 px-4">
            <a
                v-for="(item, index) in navigation"
                :key="item.name"
                :class="[
                    activeItem === item.name
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-black hover:bg-gray-200 transition duration-300',
                    index === 0 ? 'rounded-l-md' : '',
                    index === navigation.length - 1 ? 'rounded-r-md' : '',
                ]"
                class="nav-link grid-cols-6 text-center py-2 font-normal"
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
            <Disclosure v-if="isDevelopment" v-slot="{ open }">
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
                                <span class="text-red-600" v-if="usernameAddError !== ''">
                                    {{ usernameAddError }}
                                </span>
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
        <form v-if="isActive('group')" class="w-full h-3/5 overflow-x-hidden" @submit.prevent>
            <div class="flex place-items-center px-4 mb-4">
                <div class="w-full">
                    <br />
                    <span v-if="groupNameAddError !== ''" class="text-red-600">
                        {{ groupNameAddError }}
                    </span>
                    <div>
                        <label for="groupName" class="block text-sm font-medium text-gray-700">Group name</label>
                        <div class="relative">
                            <input
                                id="groupName"
                                v-model="groupNameAdd"
                                v-focus
                                class="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md mt-1"
                                name="groupName"
                                placeholder="Group name"
                                type="text"
                            />
                            <div
                                v-if="!!groupNameAdd"
                                @click="groupNameAdd = ''"
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
                    :data="filteredContacts"
                    :error="usernameAddError"
                    :usersInGroup="usersInGroup"
                    placeholder="Search for user..."
                ></UserTableGroup>
            </div>

            <div class="flex mt-4 px-4 justify-end w-full">
                <button
                    class="rounded-md border border-gray-400 px-4 py-2 justify-self-end transition hover:bg-gray-50"
                    @click="$emit('closeDialog')"
                >
                    Cancel
                </button>
                <button
                    class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-primary hover:bg-accent-700 transition duration-300"
                    @click="groupAdd"
                >
                    Add Group
                </button>
            </div>
        </form>
    </div>
</template>

<script lang="ts" setup>
    import { usechatsActions, useChatsState } from '@/store/chatStore';
    import { ref, onBeforeMount } from 'vue';
    import { useContactsActions, useContactsState } from '@/store/contactStore';
    import { useAuthState } from '@/store/authStore';
    import { Contact, DtContact, GroupContact, Roles } from '@/types';
    import UserTable from '@/components/UserTable.vue';
    import UserTableGroup from '@/components/UserTableGroup.vue';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { ChevronUpIcon } from '@heroicons/vue/solid';
    import { hasSpecialCharacters } from '@/services/fileBrowserService';
    import { blocklist, getUnblockedContacts } from '@/store/blockStore';

    const emit = defineEmits(['closeDialog']);
    const { groupContacts, contacts } = useContactsState();
    const { retrieveContacts, addContact } = useContactsActions();
    const { user } = useAuthState();

    const usernameInGroupAdd = ref('');
    const navigation = ref([
        { name: 'user', text: 'Add a user' },
        { name: 'group', text: 'Create a group' },
    ]);

    const filteredContacts = ref<GroupContact[]>(groupContacts.filter(c => !blocklist.value.includes(c.id.toString())));
    const possibleUsers = ref<Contact[]>([]);
    const isDevelopment = ref(false);

    onBeforeMount(async () => {
        isDevelopment.value = process.env.NODE_ENV === 'development';
        const { dtContacts } = useContactsState();
        possibleUsers.value = dtContacts;
        await retrieveContacts();
        filteredContacts.value = await getUnblockedContacts(filteredContacts.value, user.id.toString());
    });

    const usernameAddError = ref('');
    const contactAddError = ref('');
    const manualContactAddUsername = ref<string>('');
    const manualContactAddLocation = ref('');

    const contactAdd = (contact: Contact) => {
        const contactToAdd: Contact = {
            id: contact?.id ?? manualContactAddUsername.value,
            location: contact?.location ?? manualContactAddLocation.value,
        };
        const { chats } = useChatsState();

        try {
            const contactFound = chats.value
                .filter(chat => !chat.isGroup)
                .some(chat => chat.chatId === contactToAdd.id);
            if (contactFound) {
                usernameAddError.value = 'Already added this user';
                return;
            }

            addContact(contactToAdd.id, contactToAdd.location);
            manualContactAddUsername.value = undefined;
            contactAddError.value = '';
            emit('closeDialog');
        } catch (err) {
            contactAddError.value = err;
        }
    };

    const activeItem = ref('user');

    const isActive = (menuItem: string) => {
        return activeItem.value === menuItem;
    };

    const groupNameAddError = ref('');

    const setActive = (menuItem: string) => {
        activeItem.value = menuItem;
        groupNameAddError.value = '';
        usernameAddError.value = '';
    };

    const groupNameAdd = ref('');
    const usersInGroup = ref<GroupContact[]>([]);

    const groupAdd = async () => {
        const { addGroupChat } = usechatsActions();

        if (groupNameAdd.value == '') {
            groupNameAddError.value = 'Please enter a group name';
            return;
        }
        if (hasSpecialCharacters(groupNameAdd.value)) {
            groupNameAddError.value = 'No special characters allowed in group names.';
            return;
        }
        if (groupNameAdd.value.length > 50) {
            groupNameAddError.value = "The name can't contain more than 50 characters";
            return;
        }

        usersInGroup.value.push({
            id: user.id,
            location: user.location,
            roles: [Roles.USER, Roles.MODERATOR, Roles.ADMIN],
        });

        addGroupChat(groupNameAdd.value, usersInGroup.value);
        usersInGroup.value = [];
        emit('closeDialog');
    };
</script>

<style scoped></style>
