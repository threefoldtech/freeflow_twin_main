<template>
    <div
        class="relative md:mx-4 px-4 bg-white rounded-t-xl"
        style="height: 220px; overflow-y: scroll"
    >
        <div class="sticky top-0 bg-white flex py-4">
            <input
                type="text"
                placeholder="Search for gif..."
                v-model="searchTerm"
            />
            <button @click="$emit('close')">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="grid grid-cols-3 place-items-center bg-black">
            <img
                class="h-40 object-contain"
                v-for="gif in gifs"
                :src="gif"
                :key="gif"
                alt=""
                @click="$emit('sendgif', gif)"
            />
        </div>
        <span v-if="gifs.length === 0">no Gifs found</span>
    </div>
</template>
<script lang="ts">
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
