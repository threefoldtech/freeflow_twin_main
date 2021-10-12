<template>
    <div class="mt-4 relative rounded-md shadow-sm">
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
            v-focus
        />
    </div>
    <div class="flex flex-col mt-4 relative pt-10">
        <div class="overflow-auto">
            <div class="align-middle inline-block min-w-full sm:max-h-[40vh]">
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200 block">
                        <thead class="bg-gray-100 block absolute top-0 w-full z-10">
                            <tr class="block">
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
                                        block
                                    "
                                >
                                    Users
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 block overflow-auto">
                            <tr class="w-full block" v-for="(item, index) in searchResults()" :key="index">
                                <td class="px-6 py-4 whitespace-nowrap w-full block">
                                    <div class="flex items-center justify-between">
                                        <div class="flex">
                                            <div class="flex-shrink-0 h-10 w-10">
                                                <AvatarImg :id="item.id" alt="contact image" />
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">
                                                    {{ item.id }}
                                                </div>
                                                <div class="flex align-center text-sm text-gray-500">
                                                    <em
                                                        class="w-5 text-gray-400 fas fa-map-marker-alt mr-2"
                                                        aria-hidden="true"
                                                    />
                                                    {{ item.location }}
                                                </div>
                                                <div class="flex align-center text-sm text-gray-500">
                                                    <em
                                                        class="w-5 text-gray-400 fas fa-location-arrow mr-2 text-center"
                                                        aria-hidden="true"
                                                    />
                                                    {{ item.app_id }}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            @click="handleClick(item)"
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
                                            Invite to chat
                                        </button>
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
    import { Contact } from '@/types';
    import { defineComponent, ref, computed, onMounted, PropType } from 'vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { SearchIcon, LocationMarkerIcon } from '@heroicons/vue/solid';

    interface IProps {
        placeholder?: string;
        data: any[];
    }

    const props = withDefaults(defineProps<IProps>(), {
        placeholder: 'Enter text here.',
    });

    const emit = defineEmits(['addContact']);

    const chosenOption = ref('');
    const searchTerm = ref('');

    const reset = () => {
        chosenOption.value = '';
        searchTerm.value = '';
    };

    const handleClick = (item: Contact) => {
        console.log(item);
        emit('addContact', item);
    };

    const searchResults = () => {
        return props.data.filter((item: Contact) => {
            return item.id.toLowerCase().includes(searchTerm.value.toLowerCase());
        });
    };
</script>

<style scoped>
    .mh-48 {
        max-height: 10rem;
    }
</style>
