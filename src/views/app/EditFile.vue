<template>
  <div id="docwrapper" class="h-screen">
    <div id="placeholder"></div>
  </div>
</template>

<script lang='ts'>
import {defineComponent, onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {createModel, FullPathInfoModel, getFile} from '@/store/fileBrowserStore';
import {get} from 'scriptjs';
import config from '../../../public/config/config';
import {DtId} from '@/types';
import axios, {ResponseType} from 'axios';
import {useAuthState} from '@/store/authStore';
import {watchingUsers} from '@/store/statusStore';

export default defineComponent({
  name: 'EditFile',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const fileInfo = ref<FullPathInfoModel>();

    onMounted(() => {
      renderDocument();
      get(`${config.documentServerUrl}/web-apps/apps/api/documents/api.js`, () => {
        if (route.params.share === 'shared') {
          renderExternalDocument();
          return;
        }
        renderDocument();
      });
    });

    const renderDocument = async () => {
      const path = atob(<string>route.params.id);
      if (!path) router.push({name: "filebrowser"});
      fileInfo.value = await getFile(path);
      if (!fileInfo.value || !fileInfo.value.isFile)
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
    const renderExternalDocument = async () => {
      const res = atob(<string>route.params.id);
      const issuer = <string>route.params.issuer;
      const permissions = atob(<string>route.params.perms);
      let edit = permissions === 'write'
      const object = JSON.parse(res);
      if (!object) router.push({ name: 'filebrowser' });
      fileInfo.value = createModel(object) as FullPathInfoModel;
      if (!fileInfo.value || !fileInfo.value.isFile)
        return;
      const name = window.location.host.split('.')[0];
      const readUrl = `http://${issuer}-chat/api/browse/internal/files?path=${fileInfo.value.path}&token=${fileInfo.value.readToken}`;
      const writeUrl = `http://${issuer}-chat/api/browse/internal/files?path=${fileInfo.value.path}&token=${fileInfo.value.writeToken}`;
      const config = {
        document: {
          fileType: fileInfo.value.extension,
          key: fileInfo.value.key,
          title: fileInfo.value.name,
          url: readUrl,
          permissions: {
            edit: edit,
          },
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