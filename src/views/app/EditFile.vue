<template>
<div v-if="fileType">
    <div v-if="isSupportedInDocumentServer" id="docwrapper" class="h-screen">
        <div id="placeholder"></div>
    </div>
    <div v-else class="flex items-center justify-center bg-gray-100 h-screen">
        <div v-if="fileType == FileType.Video">
            <video controls >
                <source :src="readUrl" >
            </video>
        </div>
        <div v-else-if="fileType == FileType.Image">
            <img :src="readUrl" />
        </div>
        <div v-else class="text-center">
            <h1 class="mb-2"> Sorry, we are not able to display the file </h1>
            <a class="bg-primary text-white p-2" :href="readUrl">Download file</a> 
        </div>
    </div>
</div>
</template>

<script lang="ts">
    const generateUrl = (
        protocol:("http"|"https"),
        owner:string,
        path:string,
        token:string,
        )=> {
            path=encodeURIComponent(path)
            token=encodeURIComponent(token)
            return `${protocol}://${owner}/api/browse/internal/files?path=${path}&token=${token}`;
        }


    import { computed, defineComponent, onMounted, ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import {
        createModel,
        FullPathInfoModel,
        getFile,
        fetchShareDetails,
        fetchFileAccessDetails,
        getExtension,
        FileType,
        getFileType,
    } from '@/store/fileBrowserStore';
    import { get } from 'scriptjs';
    import config from '@/config'; '../../../public/config/config';
    import { DtId } from '@/types';
    import axios, { ResponseType } from 'axios';
    import { useAuthState } from '@/store/authStore';
    import { watchingUsers } from '@/store/statusStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { EditPathInfo, getFileInfo, PathInfo } from '@/services/fileBrowserService';

    export default defineComponent({
        name: 'EditFile',
        setup() {
            const route = useRoute();
            const router = useRouter();
            const fileType = ref<FileType>()
            const readUrl = ref<string>()
            
            const isSupportedInDocumentServer = computed(()=> {
return [FileType.Excel, FileType.Word, FileType.Powerpoint, FileType.Pdf].some(x => x === fileType.value)
            })

            onMounted(async () => {
                const path = atob(<string>route.params.path);
                const shareId = <string>route.params.shareId;
                let name;
                let documentServerconfig;
                let fileAccesDetails: EditPathInfo;

                if (shareId) {
                    const shareDetails = await fetchShareDetails(shareId);
                    fileAccesDetails = await fetchFileAccessDetails(shareDetails.owner, shareId, path);
                    name = shareDetails.owner.id;
                    console.log("sharedetails ", shareDetails)
                        
                    let apiEndpoint =  generateUrl("http",`[${shareDetails.owner.location}]`, fileAccesDetails.path,fileAccesDetails.readToken)
                    apiEndpoint =encodeURIComponent(apiEndpoint);
                    const externalfileurl = calcExternalResourceLink(apiEndpoint)


                    readUrl.value = externalfileurl
                } else {
                    fileAccesDetails = (await getFileInfo(path)).data;
                    //@todo find better way to get name
                    name = window.location.host.split('.')[0];
                    readUrl.value = generateUrl('https', window.location.hostname, fileAccesDetails.path,fileAccesDetails.readToken)

                }

                fileType.value = getFileType(getExtension(fileAccesDetails.fullName));

                console.log(fileType.value)
                if (isSupportedInDocumentServer.value) {
                    documentServerconfig = generateDocumentserverConfig(
                        name,
                        fileAccesDetails.path,
                        fileAccesDetails.key,
                        fileAccesDetails.readToken,
                        fileAccesDetails.writeToken,
                        getExtension(fileAccesDetails.fullName),
                        fileAccesDetails.extension
                    );
                    get(`${config.documentServerUrl}/web-apps/apps/api/documents/api.js`, () => {
                        console.log(documentServerconfig);
                        //@ts-ignore
                        new window.DocsAPI.DocEditor('placeholder', documentServerconfig);
                    });

                      }else if (fileType.value === FileType.Image) {
                        //   readUrl.value = generateUrl(name, fileAccesDetails.path,fileAccesDetails.readToken)
                            //   const response = await Api.downloadFile(fileAccesDetails.readToken);
                        //   const result = window.URL.createObjectURL(response.data);
                        //   setImageSrc(result);
        
                      } else if (fileType.value === FileType.Video) {
                        //   readUrl.value = generateUrl(name, fileAccesDetails.path,fileAccesDetails.readToken)
                            //   const response = await Api.downloadFile(fileAccesDetails.readToken, 'arraybuffer');
                        //   const file = new Blob([response.data], { type: `video/${fileAccesDetails.extension}` });
                        //   const url = URL.createObjectURL(file);
                        //   window.open(url, '_blank');
                      }
            });



            const generateDocumentserverConfig = (
                ownerId: string,
                path: string,
                key: string,
                readToken: string,
                writeToken: string | undefined,
                extension: string,
                fileName: string
            ) => {
                const readUrl = generateUrl('http',`${ownerId}-chat`,path,readToken);
                const writeUrl = generateUrl('http',`${ownerId}-chat`,path,writeToken);
                //@todo find better way to get name
                const name = window.location.host.split('.')[0];
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
                            id: name,
                            name: name,
                        },
                        mode: writeToken ? 'edit' : 'view',
                    },
                };
            };
            return {
                FileType,
                fileType,
                isSupportedInDocumentServer,
                readUrl
            }
        },
    });
</script>

<style scoped></style>
