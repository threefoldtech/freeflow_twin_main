<template>
    <div class="flex items-center p-2 pb-6">
        <audio ref="audiofile" :src="src" class="hidden" preload="auto"></audio>
        <button
            v-if="isPlaying"
            class="
                ml-0.5
                bg-white
                p-1.5
                rounded-full
                text-gray-400
                hover:text-accent-400
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500
            "
            type="button"
            @click="isPlaying = false"
        >
            <PauseIcon aria-hidden="true" class="h-5 w-5" />
            <span class="sr-only">Pause</span>
        </button>
        <button
            v-else
            class="
                ml-0.5
                bg-white
                p-1.5
                rounded-full
                text-gray-400
                hover:text-accent-400
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500
            "
            type="button"
            @click="isPlaying = true"
        >
            <PlayIcon aria-hidden="true" class="h-5 w-5" />
            <span class="sr-only">Play</span>
        </button>
        <input
            :value="progress"
            class="overflow-hidden appearance-none bg-gray-300 h-6 w-128 ml-2"
            max="100"
            min="1"
            step="1"
            type="range"
            @change="updatePlayback"
        />
    </div>
</template>

<script lang="ts" setup>
    import { PlayIcon, PauseIcon } from '@heroicons/vue/solid';
    import { nextTick, ref, watch } from 'vue';

    interface Props {
        src: any;
    }

    const props = defineProps<Props>();
    const isPlaying = ref(false);
    const audiofile = ref(null);
    const progress = ref(0);

    watch(isPlaying, value => (value ? audiofile.value?.play() : audiofile.value?.pause()));

    nextTick(async () => {
        while (audiofile.value?.duration === Infinity) {
            await new Promise(r => setTimeout(r, 500));
            audiofile.value.currentTime = 10000000 * Math.random();
        }
        let duration = audiofile.value.duration;
        console.log({ duration });
        audiofile.value.addEventListener('timeupdate', () => {
            const number = Math.floor((100 / audiofile.value?.duration) * audiofile.value?.currentTime);
            console.log({ number, duration: audiofile.value?.duration, current: audiofile.value?.currentTime });
            progress.value = number;
        });
    });
    const updatePlayback = e => {
        const newValue = Math.round(e.target.value / 100);
        audiofile.value.currentTime = Math.round(audiofile.value?.duration * newValue);
        progress.value = newValue;
    };
</script>

<style scoped>
    /* currently no other way :sad: */
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
        input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            cursor: ew-resize;
            box-shadow: -405px 0 0 400px #5bcfa9;
            @apply bg-accent-500 h-[9999px] w-1;
        }
    }
</style>
