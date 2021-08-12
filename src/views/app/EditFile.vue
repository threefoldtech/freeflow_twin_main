<template>
  <div id="docwrapper" class="h-screen">
    <div id="placeholder"></div>
  </div>
</template>

<script lang='ts'>
import {defineComponent, onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {createModel, FullPathInfoModel, getFile, fetchShareDetails, fetchFileAccessDetails, getExtension} from '@/store/fileBrowserStore';
import {get} from 'scriptjs';
import config from '../../../public/config/config';
import {DtId} from '@/types';
import axios, {ResponseType} from 'axios';
import {useAuthState} from '@/store/authStore';
import {watchingUsers} from '@/store/statusStore';
import { calcExternalResourceLink } from '@/services/urlService';
import { getFileInfo } from '@/services/fileBrowserService';

export default defineComponent({
  name: 'EditFile',
  setup() {
    const route = useRoute();
    const router = useRouter();

    onMounted(async () => {
      const path = atob(<string>route.params.path);
      const shareId = <string>route.params.shareId
      let fileLocation = '/api/browse/files/info?params='//${btoa(JSON.stringify(params))}
      let documentServerconfig;


      if(shareId) {
        const shareDetails = await fetchShareDetails(shareId)
        const fileAccesDetails = await fetchFileAccessDetails(shareDetails.owner, shareId)
        documentServerconfig = generateDocumentserverConfig(
        shareDetails.owner.id,
        shareDetails.path,
        fileAccesDetails.key,
        fileAccesDetails.readToken,
        fileAccesDetails.writeToken,
        getExtension(shareDetails.name),
        shareDetails.name
        )
      }
      else {
        //@todo find better way to get name
        const name = window.location.host.split(".")[0]
        const fileAccesDetails = (await getFileInfo(path)).data
        documentServerconfig = generateDocumentserverConfig(
        name,
        fileAccesDetails.path,
        fileAccesDetails.key,
        fileAccesDetails.readToken,
        fileAccesDetails.writeToken,
        getExtension(fileAccesDetails.fullName),
        fileAccesDetails.extension
        )
      }



      get(`${config.documentServerUrl}/web-apps/apps/api/documents/api.js`, () => {
       console.log(documentServerconfig)
        //@ts-ignore
        new window.DocsAPI.DocEditor('placeholder', documentServerconfig);
      });
    });



    
    const generateDocumentserverConfig = (ownerId:string,path:string,key:string, readToken:string, writeToken:string|undefined, extension:string,fileName:string) => {
      const readUrl = `http://${ownerId}-chat/api/browse/internal/files?path=${path}&token=${readToken}`;
      const writeUrl = `http://${ownerId}-chat/api/browse/internal/files?path=${path}&token=${writeToken}`;
      //@todo find better way to get name
      const name = window.location.host.split(".")[0]
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
          mode: writeToken? 'edit' : 'view'
        },
      };

    }
  }
});
</script>

<style scoped>

</style>