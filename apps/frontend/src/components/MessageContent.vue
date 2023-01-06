<template>
    <StringContent v-if="message.type === MessageTypes.STRING" :message="message" />
    <SystemContent v-else-if="message.type === MessageTypes.SYSTEM" :message="message" />
    <AudioContent v-else-if="message.type === MessageTypes.FILE && isAudio(message.body.filename)" :message="message" />
    <ImageContent
        v-else-if="
            (message.type === MessageTypes.FILE && isImage(message.body.filename)) ||
            (message.type === MessageTypes.FILE_SHARE && isImage(message.body.name))
        "
        :message="message"
    />
    <VideoContent
        v-else-if="
            (message.type === MessageTypes.FILE && isVideo(message.body.filename)) ||
            (message.type === MessageTypes.FILE_SHARE && isVideo(message.body.name))
        "
        :message="message"
    />
    <FileContent
        v-else-if="message.type === MessageTypes.FILE"
        :message="message"
        :isDownloadingAttachment="props.isDownloadingAttachment"
        @showFile="showFile"
    />
    <GifContent v-else-if="message.type === MessageTypes.GIF" :message="message" />
    <QuoteContent
        v-else-if="message.type === MessageTypes.QUOTE"
        :message="message"
        :preventRecursion="preventRecursion"
    />
    <FileShareContent v-else-if="message.type === MessageTypes.FILE_SHARE" :message="message" @showFile="showFile" />
    <PostShareContent v-else-if="message.type === MessageTypes.POST_SHARE" :message="message" />
    <StringContent v-else :message="message" />

    <div
        v-if="showFilePreview"
        class="inset-0 bg-black bg-opacity-50 w-full h-full flex justify-center items-center z-50 fixed md:p-8 p-0"
        @click.self="closeEditor()"
    >
        <XIcon
            class="absolute right-4 top-4 md:w-12 md:h-12 sm:w-10 sm:h-10 w-8 h-8 cursor-pointer text-white z-50"
            @click="closeEditor()"
        />

        <button
            v-if="!readOnly"
            @click="saveChanges(true)"
            class="sm:py-2 py-1 sm:px-4 px-2 ml-2 text-white rounded-md justify-self-end bg-primary absolute left-5 top-4 border-2"
        >
            <SaveIcon class="w-6 h-6 inline-block mr-2" />
            Save changes
        </button>

        <MonacoEditor
            theme="vs"
            v-model="editedFileContent"
            :extension="extension"
            :options="{ readOnly }"
            class="w-screen md:h-[80vh] sm:h-[85vh] h-[88vh] md:mt-0 mt-10"
        />
    </div>

    <Dialog :modelValue="showConfirmDialog" @updateModelValue="saveChanges" :noActions="true">
        <template v-slot:title class="center">
            <h1 class="font-medium">File has been modified</h1>
        </template>
        <div class="flex justify-end mt-2 px-4">
            <button @click="saveChanges(false)" class="rounded-md border border-gray-400 px-4 py-2 justify-self-end">
                Discard changes
            </button>
            <button @click="saveChanges(true)" class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-primary">
                Save changes
            </button>
        </div>
    </Dialog>
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
    import MonacoEditor from '@/components/MonacoEditor.vue';
    import { XIcon, SaveIcon } from '@heroicons/vue/solid';
    import Dialog from '@/components/Dialog.vue';

    import { isAudio, isImage, isVideo } from '@/services/contentService';
    import { Message, MessageTypes, SharePermission, SharePermissionInterface } from '@/types';
    import { ref } from 'vue';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { updateFile } from '@/services/fileBrowserService';
    import { fetchFileAccessDetails, sharedItem } from '@/store/fileBrowserStore';
    import { useAuthState } from '@/store/authStore';

    interface Props {
        message: Message<any>;
        preventRecursion?: boolean;
        isDownloadingAttachment?: boolean;
    }

    const { user } = useAuthState();

    const props = withDefaults(defineProps<Props>(), { preventRecursion: false, isDownloadingAttachment: false });
    const showFilePreview = ref(false);
    const filePreviewSrc = ref('');
    const fileContent = ref('');
    const editedFileContent = ref('');
    const extension = ref('');
    const readOnly = ref(true);

    const showFile = async (item: { name: string; url: string; permission?: SharePermissionInterface }) => {
        extension.value = item.name.split('.').pop();

        filePreviewSrc.value = calcExternalResourceLink(item.url);

        fileContent.value = await (await fetch(filePreviewSrc.value)).text();
        const canWrite = item.permission?.sharePermissionTypes?.includes(SharePermission.Write);
        if (canWrite || sharedItem.value?.owner.id === user.id) readOnly.value = false;
        editedFileContent.value = fileContent.value;
        showFilePreview.value = true;
    };

    const showConfirmDialog = ref(false);

    const closeEditor = () => {
        showFilePreview.value = false;
        if (editedFileContent.value === fileContent.value) return;
        showConfirmDialog.value = true;
    };

    const saveChanges = async (save: boolean) => {
        showFilePreview.value = false;
        showConfirmDialog.value = false;
        extension.value = undefined;

        if (!save) return;

        if (editedFileContent.value !== fileContent.value) {
            const { owner, path, id } = sharedItem.value;
            const fileAccessDetails = await fetchFileAccessDetails(owner, id, path, false);

            const { readToken, key } = fileAccessDetails;
            await updateFile(sharedItem.value.path, editedFileContent.value, owner.location, readToken, key);
        }
    };
</script>
