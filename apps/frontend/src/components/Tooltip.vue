<template>
    <div class="toolbox relative inline-block z-60">
        <slot name="source">
            <div class="fas fa-question h-6 w-6 text-gray-500" aria-hidden="true"></div>
        </slot>
        <div
            class="inline-block absolute transition-opacity duration-500 invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 w-max top-6"
        >
            <div class="flex flex-col my-2">
                <p class="text-white">{{ textItem }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    interface IProps {
        textItem: string;
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
