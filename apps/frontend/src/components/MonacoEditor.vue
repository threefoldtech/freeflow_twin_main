<template>
    <div class="w-full h-full">
        <div class="w-[98%] h-full ml-auto mr-auto" id="editor"></div>
    </div>
</template>

<script lang="ts" setup>
    import { onMounted, onUnmounted } from 'vue';
    import loader from '@monaco-editor/loader';
    import { useDebounceFn } from '@vueuse/core';
    import { extensionToLanguage } from '@/services/contentService';

    // add language to MonacoWebpackPlugin in vue.config.js if not already there
    interface IProps {
        options?: any;
        modelValue?: string;
        extension?: string;
    }

    const props = withDefaults(defineProps<IProps>(), {
        options: { miniMap: { enabled: false } },
    });

    const emit = defineEmits(['update:modelValue']);

    onMounted(async () => {
        const monaco = await loader.init();
        const lang = extensionToLanguage(props.extension);

        const editor = monaco.editor.create(document.getElementById('editor'), {
            value: props.modelValue ?? '',
            theme: 'vs',
            padding: { top: 20, bottom: 20 },
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
            minimap: { enabled: false },
            ...props.options,
        });
        monaco.editor.setModelLanguage(editor.getModel(), lang);

        editor.getModel().onDidChangeContent(
            useDebounceFn(() => {
                emit('update:modelValue', editor.getValue());
            }, 500)
        );
    });

    onUnmounted(async () => {
        const monaco = await loader.init();
        monaco.editor.getModels().forEach(model => {
            model.dispose();
        });
    });
</script>

<style scoped></style>
