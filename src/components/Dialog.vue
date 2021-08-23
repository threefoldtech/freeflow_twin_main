<template>
    <transition name="fade">
        <div
            @keydown.esc="$emit('update-model-value', false)"
            v-if="modelValue"
            class="fixed z-50 top-0 left-0 bg-black bg-opacity-50 w-screen h-screen grid place-items-center"
        >
            <div
                class="form-container bg-white p-4 lg:w-2/5 w-10/12 max-w-full rounded"
            >
                <div class="flex justify-between">
                    <slot name="title" />
                    <button @click="$emit('update-model-value', false)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="py-2 flex-col">
                    <slot />
                </div>
                <div class="flex justify-end mt-2" v-if="!noActions">
                    <button class="rounded-md border border-gray-400 px-4 py-2 justify-self-end" @click="$emit('update-model-value', false)">
                        {{ cancelButtonText }}
                    </button>
                    <button class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-btngreen" @click="$emit('update-model-value', true)">
                        {{ okButtonText }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>
<script lang="ts">
    import { defineComponent } from 'vue';
    export default defineComponent({
        props: {
            modelValue: {
                type: Boolean,
                default: false,
            },
            noActions: {
                type: Boolean,
                default: false,
            },
            okButtonText: {
                type: String,
                default: 'Ok',
            },
            cancelButtonText: {
                type: String,
                default: 'Cancel',
            },
        },
        emits: ['update-model-value'],
    });
</script>
