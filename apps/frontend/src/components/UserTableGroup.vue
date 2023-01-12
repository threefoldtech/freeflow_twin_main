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
    <div class="flex flex-col mt-4 relative pt-10">
        <div class="overflow-y-auto overflow-x-hidden border-b">
            <div class="align-middle inline-block min-w-full max-h-[60vh] sm:max-h-[40vh]">
                <div class="overflow-hidden border-b border-gray-200">
                    <table class="min-w-full divide-y divide-gray-200 block">
                        <thead class="w-full block absolute top-0 z-10 bg-gray-100">
                            <tr class="block w-full pr-10">
                                <th
                                    scope="col"
                                    class="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider block"
                                >
                                    Users
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 block overflow-auto">
                            <tr
                                v-for="(item, index) in searchResults()"
                                :key="index"
                                @click="clickCheckBox(item, index)"
                                class="w-full block cursor-pointer"
                            >
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <label :for="index" class="flex items-center">
                                        <div class="mr-5">
                                            <input
                                                :id="index"
                                                :value="item"
                                                :ref="el => (checkBoxes[index] = el)"
                                                type="checkbox"
                                                class="focus:ring-white h-5 w-5 text-accent-600 border-gray-300 rounded-full justify-self-start"
                                            />
                                        </div>
                                        <div class="flex">
                                            <div class="flex-shrink-0 h-10 w-10">
                                                <AvatarImg :id="item.id" :contact="item" alt="contact image" />
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">
                                                    {{ item.id }}
                                                </div>
                                                <div class="text-sm text-gray-500 md:hidden">
                                                    {{ item.location }}
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
    import { Contact, GroupContact } from '@/types';
    import { nextTick, ref, watch } from 'vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { SearchIcon } from '@heroicons/vue/solid';
    import { useDebounceFn } from '@vueuse/core';

    interface IProps {
        modelValue?: string;
        placeholder: string;
        data: GroupContact[];
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

    const checkBoxes = ref([]);

    const clickCheckBox = useDebounceFn((item: Contact, index: number) => {
        const checkbox = checkBoxes.value[index] as HTMLInputElement;
        if (userIsInGroup(item)) {
            removeUserFromGroup(item);
            checkbox.checked = false;
            return;
        }
        props.usersInGroup.push(item);
        checkbox.checked = true;
    }, 5);

    const handleInput = evt => {
        emit('update:modelValue', evt.target.value);
    };

    const searchTerm = ref('');

    const searchResults = () => {
        return props.data.filter((c: Contact) => {
            return c.id?.toLowerCase().includes(searchTerm.value.toLowerCase());
        });
    };

    const userIsInGroup = (contact: Contact) => {
        const user = props.usersInGroup.find(c => c.id == contact.id);
        return !!user;
    };

    const removeUserFromGroup = (contact: Contact) => {
        const index = props.usersInGroup.findIndex(u => u.id == contact.id);
        props.usersInGroup.splice(index, 1);
    };

    watch(searchResults, () => {
        for (let user of searchResults()) {
            const index = searchResults().findIndex(c => c.id == user.id);
            if (userIsInGroup(user)) {
                nextTick(() => (checkBoxes.value[index].checked = true));
                continue;
            }
            nextTick(() => (checkBoxes.value[index].checked = false));
        }
    });
</script>

<style scoped></style>
