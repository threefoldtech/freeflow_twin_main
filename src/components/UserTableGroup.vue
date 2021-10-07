<template>
    <div class="mt-2 mx-1 relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
            type="text"
            v-model="searchTerm"
            @focus="handleInput"
            @input="handleInput"
            class="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            :placeholder="placeholder"
            :v-focus="focus"
        />
    </div>
    <div class="flex flex-col mt-4">
        <div class="-my-2 overflow-x-auto">
            <div class="py-2 align-middle inline-block min-w-full">
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100">
                            <tr>
                                <th
                                    scope="col"
                                    class="
                                        px-6
                                        py-3
                                        text-left text-xs
                                        font-medium
                                        text-gray-500
                                        uppercase
                                        tracking-wider
                                    "
                                >
                                    Users
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(item, index) in searchResults()" :key="index">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center justify-between">
                                        <div class="flex">
                                            <div class="flex-shrink-0 h-10 w-10">
                                                <AvatarImg :id="item.id" alt="contact image" />
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">
                                                    {{ item.id }}
                                                </div>
                                                <div class="text-sm text-gray-500">
                                                    {{ item.location }}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                v-if="userIsInGroup(item)"
                                                @click="removeUserFromGroup(item)"
                                                class="text-white py-2 px-4 rounded-md justify-self-end bg-btnred"
                                            >
                                                Delete invite
                                            </button>
                                            <button
                                                v-if="!userIsInGroup(item)"
                                                @click="usersInGroup.push(item)"
                                                class="
                                                    text-white
                                                    py-2
                                                    px-4
                                                    rounded-md
                                                    justify-self-end
                                                    bg-primary
                                                    hover:bg-accent-700
                                                    transition
                                                    duration-300
                                                "
                                            >
                                                Invite to group
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="!searchResults().length">
                                <td><p class="text-sm p-3 text-center">No Matching Results</p></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import { Contact } from '@/types';
    import { defineComponent, ref, computed, onMounted, PropType } from 'vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { SearchIcon } from '@heroicons/vue/solid';
    export default defineComponent({
        components: { AvatarImg, SearchIcon },
        props: {
            modelValue: {
                type: String,
                required: false,
            },
            placeholder: {
                type: String,
                required: false,
                default: 'Enter text here.',
            },
            data: {
                type: Array,
                required: true,
            },
            usersInGroup: {
                type: Array as PropType<Contact[]>,
                required: true,
            },
            error: {
                type: String,
                default: '',
            },
            focus: {
                type: Boolean,
                default: false,
            },
        },
        emits: ['update:modelValue', 'clicked'],

        setup(props, { emit }) {
            const chosenOption = ref('');
            const searchTerm = ref('');

            const reset = () => {
                emit('update:modelValue', '');
                chosenOption.value = '';
                searchTerm.value = '';
            };

            const handleInput = evt => {
                emit('update:modelValue', evt.target.value);
            };

            const handleClick = item => {
                console.log(chosenOption.value);
                chosenOption.value = item.id;
                searchTerm.value = item.id;
                emit('update:modelValue', item.id);
                emit('clicked');
            };

            const searchResults = () => {
                return props.data.filter((item: Contact) => {
                    return item.id.toLowerCase().includes(searchTerm.value.toLowerCase());
                });
            };

            const userIsInGroup = (contact: Contact) => {
                const user = props.usersInGroup.find(c => c.id == contact.id);
                if (user) {
                    return true;
                }
                return false;
            };

            const removeUserFromGroup = (contact: Contact) => {
                const index = props.usersInGroup.findIndex(u => u.id == contact.id);
                props.usersInGroup.splice(index, 1);
            };

            return {
                reset,
                handleInput,
                handleClick,
                chosenOption,
                searchTerm,
                searchResults,
                userIsInGroup,
                removeUserFromGroup,
            };
        },
    });
</script>

<style scoped>
    .mh-48 {
        max-height: 10rem;
    }
</style>
