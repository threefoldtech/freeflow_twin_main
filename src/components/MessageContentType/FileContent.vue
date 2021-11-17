<template>
    <!-- :href="calcExternalResourceLink(message.body.url)" -->
    <a
        :download="message.body.filename"
        class="px-4 my-2 my-message:bg-accent-200"
        @click="downloadAttachmentToQuantum(message)"
    >
        <div
            class="
                icon
                bg-gray-600
                rounded-full
                h-12
                w-12
                flex
                items-center
                justify-center
                text-white
                my-message:bg-icon
            "
        >
            <i class="fas fa-file"></i>
        </div>
        <div class="pt-2 my-message:text-icon text-base">
            {{ message.body.filename }}
        </div>
    </a>
</template>

<script lang="ts" setup>
import { downloadAttachment } from '@/services/fileBrowserService';
import { calcExternalResourceLink } from '@/services/urlService';
import { FileShareMessageType, Message, MessageBodyType } from '@/types';

interface IProp {
    message: Object;
}

const props = defineProps<IProp>();

const downloadAttachmentToQuantum = (message: Message<MessageBodyType>) => {
    downloadAttachment(message);
};
</script>
