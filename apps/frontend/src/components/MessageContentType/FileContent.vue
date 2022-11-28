<template>
    <a
        :download="message.body.filename"
        class="px-4 pr-6 my-2 my-message:bg-accent-200 cursor-pointer"
        @click="openSharedFile(message)"
    >
        <div
            v-if="!isLoadingFile && !props.isDownloadingAttachment"
            class="icon bg-gray-600 rounded-full h-12 w-12 flex items-center justify-center text-white my-message:bg-icon"
        >
            <i class="fas fa-file"></i>
        </div>
        <div class="flex flex-col items-center space-y-2" v-if="isLoadingFile || props.isDownloadingAttachment">
            <Spinner />
            <small>{{ props.isDownloadingAttachment ? 'Downloading to quantum' : loadingFileMessage }}</small>
        </div>
        <div class="pt-2 my-message:text-icon text-base">
            {{ message.body.filename }}
        </div>
    </a>
</template>

<script lang="ts" setup>
    import { calcExternalResourceLink } from '@/services/urlService';
    import { Message, MessageBodyType } from '@/types';
    import { ref } from 'vue';
    import Spinner from '@/components/Spinner.vue';
    import { isSimpleTextFile } from '@/services/contentService';

    interface IProp {
        message: Message<MessageBodyType>;
        isDownloadingAttachment: boolean;
    }

    const props = defineProps<IProp>();
    const isLoadingFile = ref<boolean>(false);
    const loadingFileMessage = ref<string>('Downloading');
    const emit = defineEmits(['showFile']);

    const openSharedFile = async (message: Message<MessageBodyType>) => {
        if (isSimpleTextFile(message.body.filename)) {
            emit('showFile', { name: message.body.filename, url: message.body.url });
            return;
        }
        const url = calcExternalResourceLink((message.body as { url: string }).url);
        window.open(url, '_blank');
        return;
    };
</script>
