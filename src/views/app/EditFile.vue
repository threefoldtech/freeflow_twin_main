<template>
    <div id="docwrapper" class="h-screen">
        <div id="placeholder"></div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, onMounted, ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { FullPathInfoModel, getFile } from '@/store/fileBrowserStore';

    export default defineComponent({
        name: 'EditFile',
        setup() {
            const route = useRoute();
            const router = useRouter();
            const fileInfo = ref<FullPathInfoModel>();

            onMounted(() => {
                renderDocument();
            });

            const renderDocument = async () => {
                const path = atob(<string>route.params.id);
                if(!path) router.push({name: "filebrowser"});
                fileInfo.value = await getFile(path);
                if(!fileInfo.value || !fileInfo.value.isFile)
                    return;

                const name = window.location.host.split(".")[0]

                const config = {
                    document: {
                        fileType: fileInfo.value.extension,
                        key: fileInfo.value.key,
                        title: fileInfo.value.name,
                        url: `http://${name}-chat/api/browse/internal/files?path=${path}&token=${fileInfo.value.readToken}`,
                        info: {
                            owner: name,
                            sharingSettings: [
                                {
                                    permissions: "Full Access",
                                    user: name
                                },
                            ],
                        },
                    },
                    height: '100%',
                    width: '100%',
                    editorConfig: {
                        callbackUrl: `http://${name}-chat/api/browse/internal/files?path=${path}&token=${fileInfo.value.writeToken}`,
                        customization: {
                            chat: false,
                            forcesave: true
                        },
                        user: {
                            id: name,
                            name: name
                        }

                    },
                };
                //@ts-ignore
                new window.DocsAPI.DocEditor('placeholder', config);
            }
        }
    });
</script>

<style scoped>

</style>