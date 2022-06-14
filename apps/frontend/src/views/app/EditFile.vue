<template>
    <div v-if="isSupportedInDocumentServer" id="docwrapper" class="h-screen">
        <div id="placeholder"></div>
    </div>
    <div v-else class="flex items-center justify-center bg-gray-100 h-screen">
        <div v-if="isLoading">
            <Spinner />
        </div>

        <div v-else-if="fileType == FileType.Video">
            <video controls>
                <source :src="readUrl" />
            </video>
        </div>
        <div v-else-if="fileType == FileType.Image">
            <img class="object-contain" :src="readUrl" />
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
    import { startFetchStatusLoop, showUserOfflineMessage } from '@/store/statusStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { EditPathInfo, getFileInfo } from '@/services/fileBrowserService';
    import Spinner from '@/components/Spinner.vue';
    import { isUndefined } from 'lodash';
    import { useRoute } from 'vue-router';
    import {
        fetchShareDetails,
        fetchFileAccessDetails,
        getExtension,
        FileType,
        getFileType,
        accessDenied,
    } from '@/store/fileBrowserStore';
    import { get } from 'scriptjs';

    const route = useRoute();
    const fileType = ref<FileType>();
    const readUrl = ref<string>();
    const isLoading = ref<boolean>(true);

    const isSupportedInDocumentServer = computed(() => {
        return [FileType.Excel, FileType.Word, FileType.Powerpoint, FileType.Pdf, FileType.Html, FileType.Text].some(
            x => x === fileType.value
        );
    });

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

    onMounted(async () => {
        const path = atob(<string>route.params.path);
        const shareId = <string>route.params.shareId;
        const attachments = route.params.attachments === 'true';
        let location;
        let documentServerconfig;
        let fileAccesDetails: EditPathInfo;
        const myAddress = await myYggdrasilAddress();

        if (shareId) {
            const shareDetails = await fetchShareDetails(shareId);
            if (isUndefined(shareDetails)) isLoading.value = false;
            await startFetchStatusLoop(shareDetails.owner);
            if (showUserOfflineMessage.value || accessDenied.value) {
                isLoading.value = false;
            }
            fileAccesDetails = await fetchFileAccessDetails(shareDetails.owner, shareId, path, attachments);
            isLoading.value = false;

            location = shareDetails.owner.location;

            let apiEndpoint = generateUrl(
                'http',
                `[${shareDetails.owner.location}]`,
                fileAccesDetails.path,
                fileAccesDetails.readToken
            );
            apiEndpoint = encodeURIComponent(apiEndpoint);
            const externalfileurl = calcExternalResourceLink(apiEndpoint);

            readUrl.value = externalfileurl;
        } else {
            fileAccesDetails = (await getFileInfo(path, attachments)).data;
            //@todo find better way to get name

            location = await myYggdrasilAddress();
            readUrl.value = generateUrl(
                'https',
                window.location.hostname,
                fileAccesDetails.path,
                fileAccesDetails.readToken,
                attachments
            );
        }

        fileType.value = getFileType(getExtension(fileAccesDetails.fullName));
        if (isSupportedInDocumentServer.value) {
            documentServerconfig = generateDocumentserverConfig(
                location,
                fileAccesDetails.path,
                fileAccesDetails.key,
                fileAccesDetails.readToken,
                fileAccesDetails.writeToken,
                getExtension(fileAccesDetails.fullName),
                fileAccesDetails.fullName,
                attachments
            );

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
            readUrl.value = generateUrl(
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
            readUrl.value = generateUrl(
                'https',
                window.location.hostname,
                fileAccesDetails.path,
                fileAccesDetails.readToken
            );
            isLoading.value = false;
            return;
        }
    });

    const generateDocumentserverConfig = (
        location: string,
        path: string,
        key: string,
        readToken: string,
        writeToken: string | undefined,
        extension: string,
        fileName: string,
        isAttachement: boolean = false
    ) => {
        const readUrl = generateUrl('http', `[${location}]`, path, readToken, isAttachement);

        console.log(readUrl);

        const writeUrl = generateUrl('http', `[${location}]`, path, writeToken);

        //@todo find better way to get name
        const myName = window.location.host.split('.')[0];

        return {
            document: {
                fileType: extension,
                key: key,
                title: fileName,
                url: readUrl,
            },
            height: '100%',
            width: '100%',
            editorConfig: {
                callbackUrl: writeUrl,
                customization: {
                    chat: false,
                    forcesave: true,
                },
                user: {
                    id: myName,
                    name: myName,
                },
                mode: writeToken ? 'edit' : 'view',
            },
            showUserOfflineMessage,
            isLoading,
            Spinner,
            accessDenied,
        };
    };
</script>

<style scoped></style>
