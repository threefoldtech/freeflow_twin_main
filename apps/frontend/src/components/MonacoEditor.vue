<template>
    <div class="w-full h-full">
        <div class="w-[98%] h-full ml-auto mr-auto" id="editor"></div>
    </div>
</template>

<script lang="ts" setup>
    import { onMounted } from 'vue';
    import loader from '@monaco-editor/loader';

    // add language to MonacoWebpackPlugin in vue.config.js if not already there
    interface IProps {
        code?: string;
        language?: string;
        options?: any;
    }

    const props = withDefaults(defineProps<IProps>(), {
        code: '',
        language: 'javascript',
        options: { miniMap: { enabled: false } },
    });

    onMounted(async () => {
        const monaco = await loader.init();
        const editor = monaco.editor.create(document.getElementById('editor'), {
            value: props.code,
            language: props.language ?? 'text',
            theme: 'vs',
            padding: { top: 20, bottom: 20 },
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
            ...props.options,
        });
        editor.getModel().onDidChangeContent(() => {
            console.log('code changed', editor.getValue());
        });
    });
</script>

<style scoped></style>
