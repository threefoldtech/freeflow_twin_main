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

export default defineComponent({
  name: 'EditFile',
  setup() {
    const route = useRoute();
    const router = useRouter();

    onMounted(async () => {
      const path = atob(<string>route.params.path);
      const shareId = <string>route.params.shareId
      let ownerUrl:string;
      let fileLocation = '/api/browse/files/info?params='//${btoa(JSON.stringify(params))}
      let documentServerconfig;


      if(shareId) {
        const shareDetails = await fetchShareDetails(shareId)
        const fileAccesDetails = await fetchFileAccessDetails(shareDetails.owner, shareId)
        console.log(fileAccesDetails)
        ownerUrl = calcExternalResourceLink(
            `http://[${shareDetails.owner.location}]`,
        );

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
        ownerUrl =  `${window.location.origin}`
      }

      
      // const fileInfo = ref<FullPathInfoModel>();


      get(`${config.documentServerUrl}/web-apps/apps/api/documents/api.js`, () => {
       console.log(documentServerconfig)
        //@ts-ignore
        new window.DocsAPI.DocEditor('placeholder', documentServerconfig);
      });
    });


    // const getDocumentConfig = () => {

      // const viewConfig = getViewConfig(share.id)
      // if ([FileType.Excel, FileType.Word, FileType.Powerpoint].some(x => x === filetype)) {
      //     let info = await getExternalPathInfo(issuer, token, shareId);
      //     let editRights
      //     tokenData.data.permissions.includes("FileBrowserWrite") ? editRights='write':  editRights ='read' ;
      //     const result = router.resolve({
      //         name: 'editfile',
      //         params: { id: btoa(JSON.stringify(info)), share: 'shared', issuer: issuer, perms: btoa(editRights) },
      //     });
      //     window.open(result.href, '_blank');
      // } else {
      //     let share = await fetchShare(issuer, token, shareId);
      //     fileDownload(share, object.filename);
      // }
    // }

    // const renderDocument = async () => {
    //   const path = atob(<string>route.params.id);
    //   if (!path) router.push({name: "filebrowser"});
    //   fileInfo.value = await getFile(path);
    //   if (!fileInfo.value || !fileInfo.value.isFile)
    //     return;

    //   const name = window.location.host.split(".")[0]

    //   const config = {
    //     document: {
    //       fileType: fileInfo.value.extension,
    //       key: fileInfo.value.key,
    //       title: fileInfo.value.name,
    //       url: `http://${name}-chat/api/browse/internal/files?path=${path}&token=${fileInfo.value.readToken}`,
    //       info: {
    //         owner: name,
    //         sharingSettings: [
    //           {
    //             permissions: "Full Access",
    //             user: name
    //           },
    //         ],
    //       },
    //     },
    //     height: '100%',
    //     width: '100%',
    //     editorConfig: {
    //       callbackUrl: `http://${name}-chat/api/browse/internal/files?path=${path}&token=${fileInfo.value.writeToken}`,
    //       customization: {
    //         chat: false,
    //         forcesave: true
    //       },
    //       user: {
    //         id: name,
    //         name: name
    //       }

    //     },
    //   };
    //   //@ts-ignore
    //   new window.DocsAPI.DocEditor('placeholder', config);
    // }
    
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