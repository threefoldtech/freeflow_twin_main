<template>
    <div
        class="w-full md:w-72 lg:w-96 h-96 relative md:mx-4 bg-white rounded-t-xl flex flex-col rounded-md shadow-xl divide-y divide-gray-200"
    >
        <div class="p-4 flex">
            <div class="mt-1 relative rounded-md shadow-sm flex-grow">
                <input
                    id="searchTerm"
                    v-model="searchTerm"
                    class="focus:ring-accent-500 focus:border-accent-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                    name="searchTerm"
                    placeholder="Search ..."
                    type="text"
                    v-focus
                />
            </div>
            <div class="px-3 flex items-center cursor-pointer" @click="$emit('close')">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="p-4 overflow-y-auto flex flex-col h-full">
            <ul class="grid grid-cols-2 gap-2 gap-2 sm:gap-x-4 xl:gap-x-6" role="list">
                <li v-for="gif in gifs" class="relative" @click="$emit('sendgif', gif)">
                    <div
                        class="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-accent-500 overflow-hidden"
                    >
                        <img :src="gif" alt="" class="object-contain pointer-events-none group-hover:opacity-75" />
                    </div>
                </li>
            </ul>
            <div class="h-full flex flex-col items-center justify-center flex-grow" v-if="searching">
                <h2 class="text-cursive mt-2">Loading ...</h2>
            </div>
            <div
                class="h-full flex flex-col items-center justify-center flex-grow"
                v-if="gifs.length === 0 && !searching"
            >
                <div>
                    <img
                        alt=""
                        class="h-48 self-center block rounded-md"
                        src="https://media0.giphy.com/media/14uQ3cOFteDaU/giphy.gif?cid=9dc0c3c4ejjgph9t6jer28bvuz97isp7r48wivzx2n7m0vj0&amp;rid=giphy.gif&amp;ct=g"
                    />
                </div>
                <h2 class="text-cursive mt-2">no Gifs found</h2>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { fetchGif } from '@/services/gifService';
    import { onBeforeMount, ref, watch } from 'vue';
    import { useDebounceFn } from '@vueuse/core';

    const emit = defineEmits(['close']);
    const props = defineProps();

    const gifs = ref([]);
    const searchTerm = ref('');
    const searching = ref(true);

    onBeforeMount(async () => {
        const res = await fetchGif(searchTerm.value);
        gifs.value = res.data.map(g => g.images.original.url);
        searching.value = false;
    });

    const debouncedFetch = useDebounceFn(async st => {
        searching.value = true;
        gifs.value = [];

        const res = await fetchGif(st);
        gifs.value = res.data.map(g => g.images.original.url);
        searching.value = false;
    }, 150);

    watch(searchTerm, st => {
        debouncedFetch(st);
    });
</script>
