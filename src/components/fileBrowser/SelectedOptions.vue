<template>
  <div class="flex flex-row">
    <div
        v-if='selectedPaths.length > 0'
        class='mx-2'>
      <p>{{ selectedPaths.length }} File(s) selected </p>

    </div>
    <div
        v-if='selectedPaths.length === 1'
        class='mx-2 cursor-pointer'
        @click="showShareDialog = true"
    >
            <span class='text-gray-400 hover:text-gray-500'>
                <i class='fas fa-share-alt'></i>
            </span>
    </div>
    <div
        v-if='selectedPaths.length === 1'
        class='mx-2 cursor-pointer'
        @click='showRenameDialog = true; newName = selectedPaths[0].name'
    >
            <span class='text-gray-400 hover:text-gray-500'>
                <i class='fas fa-pen'></i>
            </span>
    </div>
    <div
        v-if='selectedPaths.length > 0'
        class='mx-2 cursor-pointer'
        @click='downloadFiles'
    >
             <span class='text-gray-400 hover:text-gray-500'>
                <i class='fas fa-download'></i>
             </span>
    </div>
    <div
        v-if='selectedPaths.length > 0'
        class='mx-2 cursor-pointer'
        @click='copyFiles()'
    >
             <span class='text-gray-400 hover:text-gray-500'>
                <i class='fas fa-copy'></i>
             </span>
    </div>
    <div
        v-if='selectedPaths.length > 0'
        class='mx-2 cursor-pointer'
        @click='cutFiles()'
    >
             <span class='text-gray-400 hover:text-gray-500'>
                <i class='fas fa-cut'></i>
             </span>
    </div>
    <div
        v-if='selectedPaths.length > 0'
        class='mx-2 cursor-pointer'
        @click='showDeleteDialog = true'
    >
        <span class='text-red-300 hover:text-red-500'>
            <i class='fas fa-trash-alt'></i>
        </span>
    </div>
    <div
        v-if='copiedFiles.length  > 0'
        class='mx-2 px-2 py-1 text-white font-bold bg-green-400 border-2 border-green-400 hover:text-green-400 hover:bg-white rounded-md cursor-pointer flex fex-row'
        @click='copyPasteSelected'
    >
      <p>Paste {{ copiedFiles.length }} file(s)</p>
      <div
          @click.stop='clearClipboard'>
        <i class='fas fill-current text-red-400 fa-window-close fa-1x ml-1'></i>
      </div>
    </div>
    
    <jdialog v-model='showDeleteDialog' @update-model-value='showDeleteDialog = false' noActions class='max-w-10'>
      <template v-slot:title class='center'>
        <h1 class='text-center'>Deleting Files</h1>
      </template>
      <div>
        Do you really want to delete {{ selectedPaths.length }} item(s)?
      </div>
      <div class='grid grid-cols-2 mt-2'>
        <button @click='deleteFiles(selectedPaths);showDeleteDialog = false;'
                class='bg-red-500 p-2 text-white font-bold'>
          YES
        </button>
        <button @click='showDeleteDialog = false' class='p-2'>
          NO
        </button>
      </div>
    </jdialog>

    <jdialog v-model='showRenameDialog' @update-model-value='showRenameDialog = false' noActions class='max-w-10'>
      <template v-slot:title class='center'>
        <h1 class='text-center'>Renaming {{ selectedPaths[0].name }}</h1>
      </template>
      <div>
        <input
            v-model='newName'
            :placeholder='selectedPaths[0].name'
            tabindex='0'
            maxlength='260'
        />
      </div>
      <div class='grid grid-cols-2 mt-2'>
        <button @click='renameFile(selectedPaths[0], newName);newName = "";showRenameDialog = false;'
                class='bg-red-500 p-2 text-white font-bold'>
          RENAME
        </button>
        <button @click='showRenameDialog = false;newName = ""' class='p-2'>
          CANCEL
        </button>
      </div>
    </jdialog>
    <jdialog v-model='showShareDialog' @update-model-value='showShareDialog = false' noActions class='max-w-10 w-auto'>
      <template v-slot:title>

        <h1 class='text-center'>Share file</h1>
        <div class="flex items-end justify-end mr-2">
          <label class="flex items-center cursor-pointer">
            <!-- toggle -->
            <div class="mr-3 text-gray-700 font-medium">
              Read
            </div>
            <div class="relative">
              <!-- input -->
              <input type="checkbox" v-model="writeRights" class="sr-only">
              <!-- line -->
              <div class="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <!-- dot -->
              <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
            </div>
            <!-- label -->
            <div class="ml-3 text-gray-700 font-medium">
              Write
            </div>
          </label>

        </div>


      </template>
      <div
          v-for='chat in chats'
          class='h-auto border-b border-t border-gray-300 flex flex-row items-center'
          :key='chat.chatId'
      >
        <AvatarImg :id="chat.chatId" alt="contact image" class="my-2"/>
        <span class="flex-1 ml-2"> {{ chat.chatId }}</span>
        <div @click="shareFile(chat.chatId)" class="mr-2 hover:bg-gray-200 cursor-pointer">
          <i class='fas fill-current text-green-400 fa-paper-plane fa-2x'></i>
        </div>
      </div>
    </jdialog>
  </div>

</template>

<script lang='ts'>
import {computed, defineComponent, onBeforeMount, ref} from 'vue';
import {
  selectedPaths,
  deleteFiles,
  downloadFiles,
  copyPasteSelected,
  copiedFiles,
  clearClipboard,
  renameFile,
  searchDir,
  searchDirValue,
  searchResults, isDraggingFiles, moveFiles, selectedAction, Action, getToken, sharedDir
} from '@/store/fileBrowserStore';
import Dialog from '@/components/Dialog.vue';
import Button from '@/components/Button.vue';
import {sendMessageObject, usechatsActions, usechatsState} from '@/store/chatStore';
import {useSocketActions} from '@/store/socketStore';
import Avatar from '@/components/Avatar.vue';
import AvatarImg from '@/components/AvatarImg.vue';
import {SystemMessageTypes, MessageTypes} from '@/types';
import {createNotification} from '@/store/notificiationStore';

const {chats} = usechatsState();
const {retrievechats, sendMessage} = usechatsActions();

export default defineComponent({
  name: 'SelectedOptions',
  components: { AvatarImg, Button, jdialog: Dialog },
  setup() {
    let debounce;
    let showDeleteDialog = ref(false);
    let showRenameDialog = ref(false);
    let newName = ref<string>('');
    let showShareDialog = ref(false);
    let writeRights = ref(false);

    onBeforeMount(() => {
      retrievechats();
    });
    function debounceSearch(event) {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (searchDirValue.value === '') {
          searchResults.value = [];
          return;
        }
        searchDir();
      }, 600);

    }

    async function cutFiles() {
      selectedAction.value = Action.CUT
      await copyPasteSelected()
    }

    async function copyFiles() {
      selectedAction.value = Action.COPY
      await copyPasteSelected()
    }
    async function shareFile(chatId) {
      const size= selectedPaths.value[0].size
      const filename = selectedPaths.value[0].fullName
      const response = await getToken(chatId, selectedPaths.value[0].path, filename, size, writeRights.value)
      sendMessage(chatId, {token: response.data.token, fileName: filename, size: size}, MessageTypes.FILE_SHARE)
      showShareDialog.value = false
      createNotification("Shared File", "File has been shared with "+ chatId)
    }
    return {
      selectedPaths,
      deleteFiles,
      showDeleteDialog,
      showRenameDialog,
      downloadFiles,
      copyPasteSelected,
      copiedFiles,
      clearClipboard,
      newName,
      renameFile,
      searchDirValue,
      searchDir,
      searchResults,
      debounceSearch,
      isDraggingFiles,
      cutFiles,
      copyFiles,
      showShareDialog,
      chats,
      shareFile,
      createNotification,
      sharedDir,
      writeRights
    };
  },
});
</script>

<style scoped>
input:checked ~ .dot {
  transform: translateX(100%);
  background-color: #48bb78;
}
</style>