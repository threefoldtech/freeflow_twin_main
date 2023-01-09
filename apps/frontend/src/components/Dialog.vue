<template>
    <transition name="fade">
        <div
            v-if="props.modelValue"
            ref="dialogRef"
            tabindex="-1"
            class="fixed top-0 left-0 bg-black bg-opacity-50 w-screen h-full grid place-items-center"
            style="z-index: 60"
            @mousedown="$emit('update-model-value', false)"
            @keydown.esc="$emit('update-model-value', false)"
            @keydown.enter="$emit('update-model-value', true)"
        >
            <div
                class="bg-white w-full h-full lg:h-auto lg:max-w-2xl lg:w-3/4 lg:rounded-lg overflow-y-auto hide-scrollbar lg:overflow-hidden"
                @mousedown.stop
            >
                <div class="bg-accent-700 text-white lg:rounded-t-lg">
                    <div class="px-4 pt-8 pb-4 flex items-center justify-between">
                        <slot name="title" />
                        <XIcon
                            class="w-6 h-6 text-accent-300 cursor-pointer"
                            @click="$emit('update-model-value', false)"
                        />
                    </div>
                </div>
                <div class="py-2 flex-col">
                    <slot />
                </div>
                <div v-if="!noActions" class="flex justify-end px-4 mt-2 pb-2">
                    <button
                        class="rounded-md border border-gray-400 px-4 py-2 justify-self-end"
                        @click="$emit('update-model-value', false)"
                    >
                        {{ cancelButtonText }}
                    </button>
                    <button
                        class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-primary hover:bg-accent-700 transition duration-300"
                        @click="$emit('update-model-value', true)"
                    >
                        {{ okButtonText }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>
<script lang="ts" setup>
    import { onUpdated, ref } from 'vue';
    import { XIcon } from '@heroicons/vue/solid';

    interface IProps {
        modelValue?: boolean;
        okButtonText?: string;
        cancelButtonText?: string;
        noActions: boolean;
    }

    const emit = defineEmits(['update-model-value']);
    const props = withDefaults(defineProps<IProps>(), {
        modelValue: false,
        noActions: true,
        okButtonText: 'Ok',
        cancelButtonText: 'Cancel',
    });
    const dialogRef = ref<HTMLElement>(null);

    onUpdated(() => {
        if (dialogRef.value) dialogRef.value.focus();
    });
</script>
