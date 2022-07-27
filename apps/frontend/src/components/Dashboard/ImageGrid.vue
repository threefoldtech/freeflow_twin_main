<template>
    <div
        @click="$emit('resetImage')"
        class="grid grid-cols-2 gap-1 relative"
        :class="{ 'grid-cols-1': images.length === 1 }"
    >
        <div
            @click="$emit('resetImage')"
            class="z-40 absolute right-2 top-2 cursor-pointer bg-gray-800 hover:bg-gray-500 rounded-full w-8 h-8 flex items-center justify-center"
        >
            <XIcon class="w-6 text-gray-400" />
        </div>
        <div
            @click.stop
            class="max-h-[200px] overflow-hidden relative pointer-events-none"
            :key="idx"
            v-for="(image, idx) in images.slice(0, 4)"
        >
            <div
                v-if="images.length > 4 && idx === 3"
                class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <p class="text-white text-5xl">+{{ images.length - 4 }}</p>
            </div>
            <img class="object-center object-cover w-full h-full" :src="setImage(image)" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { XIcon } from '@heroicons/vue/solid';

    const props = defineProps<{ images: File[] }>();

    const setImage = (file: File) => {
        return URL.createObjectURL(file);
    };
</script>

<style scoped></style>
