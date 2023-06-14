<template>
    <div v-if="isSupported" id="docwrapper" class="h-screen">
        <div id="placeholder"></div>
    </div>

    <div v-else class="flex items-center justify-center bg-gray-100 h-screen">
        <div v-if="isLoading">
            <Spinner />
        </div>

        <div v-else-if="fileType === FileType.Video">
            <video controls>
                <source :src="readUrl" />
            </video>
        </div>

        <div v-else-if="fileType === FileType.Image">
            <img class="object-contain" :src="readUrl" alt="document" />
        </div>

        <div v-else-if="showUserOfflineMessage" class="text-center">
            <h1 class="mb-2">Unable to fetch the file. File owner seems to be offline.</h1>
        </div>

        <div v-else-if="accessDenied" class="text-center">
            <h1 class="mb-2">Your file permissions were revoked.</h1>
        </div>

        <div v-else class="text-center">
            <h1 class="mb-2">Sorry, we are not able to display the file</h1>
            <a class="bg-primary text-white p-2" :href="readUrl">Download file</a>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref } from 'vue';
    import config from '@/config';
    import { useRoute } from 'vue-router';
    import {
        accessDenied,
        fetchFileAccessDetails,
        FileType,
        getExtension,
        getFileType,
    } from '@/store/fileBrowserStore';
    import { get } from 'scriptjs';
    import { showUserOfflineMessage, startFetchStatus } from '@/store/statusStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import {
        generateDocumentServerConfig,
        generateFileBrowserUrl,
        getFileInfo,
        getShareWithId,
    } from '@/services/fileBrowserService';
    import Spinner from '@/components/Spinner.vue';
    import { getOwnLocation } from '@/services/userService';

    const route = useRoute();
    const fileType = ref<FileType>();
    const readUrl = ref('');
    const isLoading = ref(true);
    const location = ref('');

    const isSupported = computed(() => {
        return [
            FileType.Excel,
            FileType.Word,
            FileType.Powerpoint,
            FileType.Pdf,
            FileType.Html,
            FileType.Text,
        ].includes(fileType.value);
    });

    onMounted(async () => {
        const shareId = <string>route.params.shareId;
        const attachments = route.params.attachments === 'true';

        const fileAccessDetails = await getFileDetails(attachments, shareId);
        fileType.value = getFileType(getExtension(fileAccessDetails.fullName));

        if (!isSupported.value) return;

        if (!shareId) location.value = await getOwnLocation();

        const documentServerConfig = generateDocumentServerConfig(location.value, fileAccessDetails, attachments);
        get(`${config.documentServerLocation}/web-apps/apps/api/documents/api.js`, () => {
            //@ts-ignore
            new window.DocsAPI.DocEditor('placeholder', documentServerConfig);
        });
    });

    const getFileDetails = async (attachments: boolean, shareId: string) => {
        const path = atob(<string>route.params.path);

        if (shareId) {
            //if not your own file
            const shareDetails = await getShareWithId(shareId);
            if (!shareDetails) isLoading.value = false;

            await startFetchStatus(shareDetails.owner);
            if (showUserOfflineMessage.value || accessDenied.value) isLoading.value = false;
            location.value = shareDetails.owner.location;
            const fileAccessDetails = await fetchFileAccessDetails(shareDetails.owner, shareId, path, attachments);
            isLoading.value = false;

            const apiEndpoint = generateFileBrowserUrl(
                'http',
                `[${shareDetails.owner.location}]`,
                fileAccessDetails.path,
                fileAccessDetails.readToken
            );
            readUrl.value = calcExternalResourceLink(encodeURIComponent(apiEndpoint));
            return fileAccessDetails;
        }

        //your own file
        const fileInfo = (await getFileInfo(path, undefined, attachments)).data;
        isLoading.value = false;
        readUrl.value = generateFileBrowserUrl(
            'https',
            window.location.hostname,
            fileInfo.path,
            fileInfo.readToken,
            attachments
        );
        return fileInfo;
    };
</script>

<style scoped></style>
