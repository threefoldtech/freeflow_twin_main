<template>
    <!-- :href="calcExternalResourceLink(message.body.url)" -->
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
    import { downloadAttachment } from '@/services/fileBrowserService';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { Message, MessageBodyType } from '@/types';
    import { ref } from 'vue';
    import Spinner from '@/components/Spinner.vue';

    interface IProp {
        message: Object;
        isDownloadingAttachment: boolean;
    }

    const props = defineProps<IProp>();
    const isLoadingFile = ref<boolean>(false);
    const updatedAttachments = ref<any>([]);
    const loadingFileMessage = ref<string>('Downloading');

    const downloadAttachmentToQuantum = async (message: Message<MessageBodyType>) => {
        await downloadAttachment(message);
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const openSharedFile = async (message: Message<MessageBodyType>, count: number = 0) => {
        //todo: save downloaded file in attachments folder
        const url = calcExternalResourceLink((message.body as { url: string }).url);
        window.open(url, '_blank');
        return;

        // if (isLoadingFile.value || props.isDownloadingAttachment) return;
        // isLoadingFile.value = true;
        // if (count !== 0) await sleep(1500);
        // count++;
        // createNotification('Searching attachment', `from ${message.from}`, Status.Info);
        // loadingFileMessage.value = 'Searching file';
        // updatedAttachments.value = (await updateAttachments(`/${message.from}`))?.data;
        // const file = updatedAttachments.value.find(item => item.fullName === message.body.filename);
        // if (!file) {
        //     if (count === 5) return;
        //     createNotification('Downloading attachment', `from ${message.from}`, Status.Info);
        //     loadingFileMessage.value = 'Downloading file';
        //     await downloadAttachmentToQuantum(message);
        //     isLoadingFile.value = false;
        //     await openSharedFile(message);
        //     return;
        // }
        // createNotification('Trying to open file', `from ${message.from}`, Status.Info);
        // savedAttachments.value = true;
        // //@ts-ignore
        // await itemAction(file, undefined);
        // isLoadingFile.value = false;
    };
</script>
