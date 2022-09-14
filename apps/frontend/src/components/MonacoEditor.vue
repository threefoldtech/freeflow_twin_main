<template>
    <div class="w-full h-full">
        <div class="w-[98%] h-full ml-auto mr-auto" id="editor"></div>
    </div>
</template>

<script lang="ts" setup>
    import { onMounted } from 'vue';
    import loader from '@monaco-editor/loader';
    import { debounce } from 'lodash';

    // add language to MonacoWebpackPlugin in vue.config.js if not already there
    interface IProps {
        language?: string;
        options?: any;
        modelValue?: string;
    }

    const props = withDefaults(defineProps<IProps>(), {
        language: 'javascript',
        options: { miniMap: { enabled: false } },
    });

    const emit = defineEmits(['update:modelValue']);

    onMounted(async () => {
        const monaco = await loader.init();

        const editor = monaco.editor.create(document.getElementById('editor'), {
            value: props.modelValue ?? '',
            language: props.language ?? 'text',
            theme: 'vs',
            padding: { top: 20, bottom: 20 },
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
            ...props.options,
        });
        editor.getModel().onDidChangeContent(
            debounce(() => {
                emit('update:modelValue', editor.getValue());
            }, 500)
        );
    });
</script>

<style scoped></style>
