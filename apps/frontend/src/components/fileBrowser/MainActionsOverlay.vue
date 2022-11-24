<template>
    <transition name="fade">
        <div
            v-if="props.modelValue"
            ref="dialogRef"
            tabindex="-1"
            class="fixed top-0 left-0 bg-black bg-opacity-50 w-screen h-screen grid text-center place-items-end"
            style="z-index: 60"
            @mousedown="$emit('update-model-value', false)"
            @keydown.esc="$emit('update-model-value', false)"
        >
            <div class="form-container z-50 bg-white h-auto w-full overflow-auto fixed" @mousedown.stop>
                <slot name="header" />
                <slot name="content" />
            </div>
        </div>
    </transition>
</template>
<script lang="ts" setup>
    import { onUpdated, ref } from 'vue';

    interface IProps {
        modelValue?: boolean;
    }

    const emits = defineEmits(['update-model-value']);
    const props = withDefaults(defineProps<IProps>(), {
        modelValue: false,
    });

    const dialogRef = ref<HTMLElement>(null);

    onUpdated(() => {
        if (dialogRef.value) dialogRef.value.focus();
    });
</script>
