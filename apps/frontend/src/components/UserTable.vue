<template>
    <div class="mt-4 relative rounded-md shadow-sm mx-4">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
            type="text"
            v-model="searchTerm"
            class="focus:border-primary focus:ring-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            :placeholder="placeholder"
            v-focus
        />
        <div
            v-if="!!searchTerm"
            @click="reset"
            class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
        >
            <i class="fa fa-window-close h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
    </div>
    <div class="flex flex-col mt-4 relative pt-10">
        <div class="overflow-y-auto overflow-x-hidden border-b">
            <div
                class="align-middle inline-block min-w-full"
                :class="[isDevelopment ? 'max-h-[40vh]' : 'lg:max-h-[60vh]']"
            >
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
                                class="w-full block cursor-pointer"
                                v-for="(item, index) in searchResults()"
                                :key="index"
                                @click="handleClick(item)"
                            >
                                <td class="px-2 md:px-6 py-4 whitespace-nowrap w-full block">
                                    <div class="flex items-center justify-between">
                                        <div class="flex">
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">
                                                    {{ item.id }}
                                                </div>
                                                <div class="flex align-center text-sm text-gray-500">
                                                    <em
                                                        class="w-5 text-gray-400 fas fa-map-marker-alt mr-2"
                                                        aria-hidden="true"
                                                    />
                                                    <p>{{ item.location }}</p>
                                                </div>
                                                <div class="flex align-center text-sm text-gray-500">
                                                    <em
                                                        class="w-5 text-gray-400 fas fa-location-arrow mr-2 text-center"
                                                        aria-hidden="true"
                                                    />
                                                    <p>{{ item.app_id }}</p>
                                                </div>
                                            </div>
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

<script setup lang="ts">
    import { Contact, DtContact } from '@/types';
    import { onBeforeMount, ref } from 'vue';
    import { SearchIcon } from '@heroicons/vue/solid';

    interface IProps {
        placeholder?: string;
        data: Contact[];
    }

    const props = withDefaults(defineProps<IProps>(), {
        placeholder: 'Enter text here.',
    });

    const emit = defineEmits(['addContact']);

    const isDevelopment = ref<boolean>(false);

    onBeforeMount(async () => {
        isDevelopment.value = process.env.NODE_ENV === 'development';
    });

    const chosenOption = ref('');
    const searchTerm = ref('');

    const reset = () => {
        chosenOption.value = '';
        searchTerm.value = '';
    };

    const handleClick = (item: Contact) => {
        emit('addContact', item);
    };

    const searchResults = () => {
        return props.data.filter(contact => contact.id?.toLowerCase().includes(searchTerm.value?.toLowerCase()));
    };
</script>

<style scoped></style>
