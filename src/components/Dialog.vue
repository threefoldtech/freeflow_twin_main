<template>
    <transition name="fade">
        <div
            v-if="props.modelValue"
            ref="dialogRef"
            tabindex="-1"
            class="fixed top-0 left-0 bg-black bg-opacity-50 w-screen h-screen grid place-items-center"
            style="zindex: 60"
            @click="$emit('update-model-value', false)"
            @keydown.esc="$emit('update-model-value', false)"
        >
            <div
                class="form-container z-50 bg-white p-4 w-full h-screen sm:h-auto sm:w-10/12 xl:w-3/5 2xl:w-2/5 max-w-full sm:rounded overflow-auto"
                @click.stop
            >
                <div class="flex justify-between">
                    <slot name="title" />
                    <div
                        class="w-6 h-6 bg-transparent rounded-full hover:bg-gray-100 flex justify-center items-center transition duration-300"
                        @click="$emit('update-model-value', false)"
                    >
                        <button @click="$emit('update-model-value', false)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="py-2 flex-col">
                    <slot />
                </div>
                <div v-if="!noActions" class="flex justify-end mt-2">
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
    import { nextTick, onBeforeMount, onMounted, onUpdated, ref } from 'vue';

    defineEmits(['update-model-value']);

    const dialogRef = ref<HTMLElement>(null);

    onUpdated(() => {
        if (dialogRef.value) dialogRef.value.focus();
    });

    interface IProps {
        modelValue?: boolean;
        okButtonText?: string;
        cancelButtonText?: string;
        noActions: boolean;
    }

    const props = withDefaults(defineProps<IProps>(), {
        modelValue: false,
        noActions: true,
        okButtonText: 'Ok',
        cancelButtonText: 'Cancel',
    });
</script>
