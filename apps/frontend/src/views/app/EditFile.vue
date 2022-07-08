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
    import { myYggdrasilAddress } from '@/store/authStore';
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

    const route = useRoute();
    const fileType = ref<FileType>();
    const readUrl = ref<string>();
    const isLoading = ref<boolean>(true);

    const generateUrl = (
        protocol: 'http' | 'https',
        owner: string,
        path: string,
        token: string,
        attachment: boolean = false
    ) => {
        path = encodeURIComponent(path);
        token = encodeURIComponent(token);
        return `${protocol}://${owner}/api/v2/quantum/file/internal?path=${path}&token=${token}&attachment=${attachment}`;
    };

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

        const initDocumentServer = (fileInfo: EditPathInfo, location: string) => {
            fileType.value = getFileType(getExtension(fileInfo.fullName));
            console.log('fileinfo', fileInfo);

            if (isSupported.value) {
                const documentServerConfig = generateDocumentServerConfig(
                    location,
                    fileInfo.path,
                    fileInfo.key,
                    fileInfo.readToken,
                    fileInfo.writeToken,
                    getExtension(fileInfo.fullName),
                    fileInfo.extension,
                    attachments,
                    isLoading.value
                );

                console.log('documentServerConfig', documentServerConfig);

                get(
                    `https://documentserver.digitaltwin-test.jimbertesting.be/web-apps/apps/api/documents/api.js`,
                    () => {
                        //@ts-ignore
                        new window.DocsAPI.DocEditor('placeholder', documentServerConfig);
                    }
                );
                return;
            }

            //If statement so that we don't override the URl of a file that is shared
            if (readUrl.value) {
                isLoading.value = false;
                return;
            }
        };

        const init = async () => {
            if (accessDenied.value || showUserOfflineMessage.value) {
                isLoading.value = false;
                return;
            }

            const shareDetails = await getShareWithId(shareId);

            if (shareDetails) {
                await startFetchStatusLoop(shareDetails.owner);
                const location = shareDetails.owner.location;
                const fileInfo = await fetchFileAccessDetails(shareDetails.owner, shareId, path, attachments);

                const apiEndpoint = generateFileBrowserUrl(
                    'http',
                    `[${shareDetails.owner.location}]`,
                    fileInfo.path,
                    fileInfo.readToken
                );
                const encodedEndpoint = encodeURIComponent(apiEndpoint);
                readUrl.value = calcExternalResourceLink(encodedEndpoint);

                initDocumentServer(fileInfo, location);

                isLoading.value = false;
                return;
            }

            const fileInfo = (await getFileInfo(path, attachments)).data;
            const location = useAuthState().user.location;

            console.log('fileinfo', fileInfo);
            console.log('location', location);

            readUrl.value = generateFileBrowserUrl(
                'https',
                window.location.hostname,
                fileInfo.path,
                fileInfo.readToken,
                attachments
            );
            console.log('readUrl', readUrl.value);
            initDocumentServer(fileInfo, location);
            readUrl.value = generateFileBrowserUrl(
                'https',
                window.location.hostname,
                fileInfo.path,
                fileInfo.readToken
            );
            isLoading.value = false;
            if (fileType.value === FileType.Video) {
                //If statement so that we don't override the URl of a file that is shared
                if (readUrl.value) {
                    isLoading.value = false;
                    return;
                }
                readUrl.value = generateUrl(
                    'https',
                    window.location.hostname,
                    fileAccesDetails.path,
                    fileAccesDetails.readToken
                );
                isLoading.value = false;
                return;
            }
        };
        init();
    });
</script>

<style scoped></style>
