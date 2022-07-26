<template>
    <div class="toolbox relative inline-block z-60">
        <slot name="source">
            <div class="fas fa-question h-6 w-6 text-gray-500" aria-hidden="true"></div>
        </slot>
        <div
            class="hidden inline-block absolute transition-opacity duration-500 invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 w-80 ml-2 tablet:inset-x-0 tablet:top-4 tablet:ml-0"
        >
            <div class="flex flex-col whitespace-pre-line my-2" v-for="textItem of text" :key="textItem">
                <h5 class="text-primary text-center bg-white uppercase rounded p-1 mb-1">{{ textItem.title }}</h5>
                <p class="text-white">{{ textItem.explanation }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    interface IProps {
        textItem: Array;
    }

    const { textItem } = defineProps<IProps>();
</script>

<style scoped>
    .toolbox:hover .tooltip {
        visibility: visible;
        opacity: 1;
        display: block;
    }
</style>
