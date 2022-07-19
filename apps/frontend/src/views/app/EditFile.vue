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
    import { useRoute } from 'vue-router';
    import {
        accessDenied,
        fetchFileAccessDetails,
        FileType,
        getExtension,
        getFileType,
    } from '@/store/fileBrowserStore';
    import { get } from 'scriptjs';
    import { showUserOfflineMessage, startFetchStatusLoop } from '@/store/statusStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import {
        EditPathInfo,
        generateDocumentServerConfig,
        generateFileBrowserUrl,
        getFileInfo,
        getShareWithId,
    } from '@/services/fileBrowserService';
    import Spinner from '@/components/Spinner.vue';
    import { useAuthState } from '@/store/authStore';
    import { isUndefined } from 'lodash';

    const route = useRoute();
    const fileType = ref<FileType>();
    const readUrl = ref<string>();
    const isLoading = ref<boolean>(true);

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
        const path = atob(<string>route.params.path);
        const shareId = <string>route.params.shareId;
        const attachments = route.params.attachments === 'true';
        let fileAccesDetails: EditPathInfo;
        let documentServerconfig;
        let location: string = '';

        if (shareId) {
            const shareDetails = await getShareWithId(shareId);
            if (isUndefined(shareDetails)) isLoading.value = false;
            await startFetchStatusLoop(shareDetails.owner);
            if (showUserOfflineMessage.value || accessDenied.value) {
                isLoading.value = false;
            }
            location = shareDetails.owner.location;
            fileAccesDetails = await fetchFileAccessDetails(shareDetails.owner, shareId, path, attachments);
            isLoading.value = false;

            const apiEndpoint = generateFileBrowserUrl(
                'http',
                `[${shareDetails.owner.location}]`,
                fileAccesDetails.path,
                fileAccesDetails.readToken
            );
            const encodedEndpoint = encodeURIComponent(apiEndpoint);
            readUrl.value = calcExternalResourceLink(encodedEndpoint);
        } else {
            fileAccesDetails = (await getFileInfo(path, attachments)).data;
            location = useAuthState().user.location;

            readUrl.value = generateFileBrowserUrl(
                'https',
                window.location.hostname,
                fileAccesDetails.path,
                fileAccesDetails.readToken,
                attachments
            );
            console.log('readUrl', readUrl.value);
        }

        fileType.value = getFileType(getExtension(fileAccesDetails.fullName));

        if (isSupported.value) {
            console.log('isSupported', isSupported.value);
            documentServerconfig = generateDocumentServerConfig(
                location,
                fileAccesDetails.path,
                fileAccesDetails.key,
                fileAccesDetails.readToken,
                fileAccesDetails.writeToken,
                getExtension(fileAccesDetails.fullName),
                fileAccesDetails.extension,
                attachments
            );
            console.log('documentServerconfig', documentServerconfig);
            get(`https://documentserver.digitaltwin-test.jimbertesting.be/web-apps/apps/api/documents/api.js`, () => {
                //@ts-ignore
                new window.DocsAPI.DocEditor('placeholder', documentServerconfig);
            });
            return;
        }

        if (fileType.value === FileType.Image) {
            //If statement so that we don't override the URl of a file that is shared
            if (readUrl.value) {
                isLoading.value = false;
                return;
            }
            readUrl.value = generateFileBrowserUrl(
                'https',
                window.location.hostname,
                fileAccesDetails.path,
                fileAccesDetails.readToken
            );
            readUrl.value = readUrl.value;
            isLoading.value = false;
            return;
        }
        if (fileType.value === FileType.Video) {
            //If statement so that we don't override the URl of a file that is shared
            if (readUrl.value) {
                isLoading.value = false;
                return;
            }
            readUrl.value = generateFileBrowserUrl(
                'https',
                window.location.hostname,
                fileAccesDetails.path,
                fileAccesDetails.readToken
            );
            isLoading.value = false;
            return;
        }
    });
</script>

<style scoped></style>
