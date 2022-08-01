<template>
    <StringContent v-if="message.type === MessageTypes.STRING" :message="message" />
    <SystemContent v-else-if="message.type === MessageTypes.SYSTEM" :message="message" />
    <AudioContent v-else-if="message.type === MessageTypes.FILE && isAudio(message.body.filename)" :message="message" />
    <ImageContent v-else-if="message.type === MessageTypes.FILE && isImage(message.body.filename)" :message="message" />
    <VideoContent v-else-if="message.type === MessageTypes.FILE && isVideo(message.body.filename)" :message="message" />
    <FileContent
        v-else-if="message.type === MessageTypes.FILE"
        :message="message"
        :isDownloadingAttachment="props.isDownloadingAttachment"
    />
    <GifContent v-else-if="message.type === MessageTypes.GIF" :message="message" />
    <QuoteContent
        v-else-if="message.type === MessageTypes.QUOTE"
        :message="message"
        :preventRecursion="preventRecursion"
    />
    <FileShareContent v-else-if="message.type === MessageTypes.FILE_SHARE" :message="message" />
    <PostShareContent v-else-if="message.type === MessageTypes.POST_SHARE" :message="message" />
    <StringContent v-else :message="message" />
</template>

<script lang="ts" setup>
    import StringContent from '@/components/MessageContentType/StringContent.vue';
    import SystemContent from '@/components/MessageContentType/SystemContent.vue';
    import FileContent from '@/components/MessageContentType/FileContent.vue';
    import AudioContent from '@/components/MessageContentType/AudioContent.vue';
    import ImageContent from '@/components/MessageContentType/ImageContent.vue';
    import GifContent from '@/components/MessageContentType/GifContent.vue';
    import QuoteContent from '@/components/MessageContentType/QuoteContent.vue';
    import FileShareContent from '@/components/MessageContentType/FileShareContent.vue';
    import PostShareContent from '@/components/MessageContentType/PostShareContent.vue';
    import VideoContent from '@/components/MessageContentType/VideoContent.vue';

    import { isAudio, isImage, isVideo } from '@/services/contentService';
    import { Message, MessageBodyType, MessageTypes } from '@/types';
    import { watch } from 'vue';

    interface Props {
        message: Message<MessageBodyType>;
        preventRecursion?: boolean;
        isDownloadingAttachment?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), { preventRecursion: false, isDownloadingAttachment: false });
</script>
