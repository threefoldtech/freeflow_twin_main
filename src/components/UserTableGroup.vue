<template>
    <div class="mt-2 relative rounded-md shadow-s mx-4">
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
        <div
            v-if="!!searchTerm"
            @click="searchTerm = ''"
            class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
        >
            <i class="fa fa-window-close h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
    </div>
    <div class="flex flex-col mt-4 relative pt-10 md:px-4">
        <div class="overflow-auto">
            <div class="align-middle inline-block min-w-full max-h-[50vh] sm:max-h-[40vh]">
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200 block">
                        <thead class="bg-gray-100 block absolute top-0 w-full z-10">
                            <tr class="block">
                                <th
                                    scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider block"
                                >
                                    Users
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 block overflow-auto">
                            <tr v-for="(item, index) in searchResults()" :key="index" class="w-full block cursor-pointer"   >
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <label :for="index" class="flex items-center">
                                        <div class="mr-5">
                                            <input
                                                :id="index"
                                                :value="item"
                                                type="checkbox"
                                                @change="handleChangeCheckbox(item)"
                                                class="focus:ring-white h-5 w-5 text-accent-600 border-gray-300 rounded-full justify-self-start"
                                            />
                                        </div>
                                        <div class="flex">
                                            <div class="flex-shrink-0 h-10 w-10">
                                                <AvatarImg :id="item.id" alt="contact image" />
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">
                                                    {{ item.id }}
                                                </div>
                                                <div class="text-sm text-gray-500 md:hidden">
                                                    {{ trimStringMidway(item.location) }}
                                                </div>
                                                <div class="text-sm text-gray-500 hidden md:block">
                                                    {{ item.location }}
                                                </div>
                                            </div>
                                        </div>
                                    </label>
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
<script setup lang="ts">
    import { Contact } from '@/types';
    import { defineComponent, ref, computed, onMounted, PropType, defineProps, watch } from 'vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { SearchIcon } from '@heroicons/vue/solid';

    interface IProps {
        modelValue?: string;
        placeholder: string;
        data: any[];
        usersInGroup: Contact[];
        error: string;
        focus: boolean;
    }

    const props = withDefaults(defineProps<IProps>(), {
        placeholder: 'Enter text here.',
        error: '',
        focus: false,
    });

    const emit = defineEmits(['update:modelValue', 'clicked']);

    const handleChangeCheckbox = (item: Contact) => {
        switch (userIsInGroup(item)) {
            case true:
                // code block
                removeUserFromGroup(item);
                break;
            case false:
                // code block
                props.usersInGroup.push(item);
                break;
            default:
                console.log('Something went wrong');
        }
    };

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

    const trimStringMidway = (text: string) => {
        const str1 = text.substr(0, text.length / 2);
        const str2 = text.substr(text.length / 2 + 1, text.length);

        return str1.substr(0, str1.length / 2) + '...' + str2.substr(str2.length / 2, str2.length);
    };
</script>

<style scoped>
    .mh-48 {
        max-height: 10rem;
    }
</style>
