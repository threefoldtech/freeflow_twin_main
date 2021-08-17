<template>
    <div class='w-full md:w-72 lg:w-96 h-96 relative md:mx-4 bg-white rounded-t-xl flex flex-col rounded-md shadow-xl divide-y divide-gray-200'>
        <div class='sticky top-0 flex p-4 flex-0'>
            <input v-model='searchTerm' placeholder='Search for gif...' type='text' />
            <button @click="$emit('close')">
                <i class='fas fa-times'></i>
            </button>
        </div>
        <div class='p-4 overflow-y-auto'>
            <!--            <img-->
            <!--                class="h-40 object-contain"-->
            <!--                v-for="gif in gifs"-->
            <!--                :src="gif"-->
            <!--                :key="gif"-->
            <!--                alt=""-->
            <!--                @click="$emit('sendgif', gif)"-->
            <!--            />-->
            <ul class=' grid grid-cols-2 gap-2 gap-2 sm:gap-x-4 xl:gap-x-6' role='list'>
                <li v-for='gif in gifs'
                    class='relative'
                    @click="$emit('sendgif', gif)"
                >
                    <div
                        class='group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden'>
                        <img
                            :src='gif'
                            alt=''
                            class='object-contain pointer-events-none group-hover:opacity-75'
                        >
                    </div>
                </li>
            </ul>
        </div>
        <span v-if='gifs.length === 0'>no Gifs found</span>
    </div>
</template>
<script lang='ts'>
    import { fetchGif } from '@/services/gifService';
    import { ref, watch } from 'vue';

    export default {
        name: 'GifSelector',
        emits: ['close'],
        setup(props) {
            const gifs = ref([]);
            const searchTerm = ref('');

            fetchGif().then(gs => {
                gifs.value = gs.data.map(g => g.images.original.url);
            });
            watch(searchTerm, st => {
                fetchGif(st).then(gs => {
                    gifs.value = gs.data.map(g => g.images.original.url);
                });
            });

            return { gifs, searchTerm };
        },
    };
</script>
