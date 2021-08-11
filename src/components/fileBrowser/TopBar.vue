<template>
  <div class='flex flex-row my-4 items-center'>
    <div class='collapsed-bar:hidden px-2 relative' v-if="sharedDir === false">
      <input
          type='text'
          placeholder='Search'
          class='px2-2 border-gray-200 border-2 focus:border-accent border-r rounded-lg'
          v-model='searchDirValue'
          @input='debounceSearch'
      />
      <span
          v-if='searchDirValue'
          @click.prevent="searchDirValue = ''; searchResults = []"
          class='absolute inset-y-0 right-1 pr-3 flex items-center cursor-pointer'
      >
            x
        </span>
    </div>
    <div
        class='mx-2 hover:text-green-500 cursor-pointer'
        @click='goToHome'
    >
      <i class='fas fa-home fa-2x text-accent'></i>
    </div>
    <div
        class='rounded-full w-6 h-6 flex justify-center items-center'
        @click='goBack'
        :class='{
                "bg-accent hover:text-green-500 cursor-pointer": currentDirectory !== "/",
                "bg-gray-500": currentDirectory === "/"
            }'
    >
      <i class='fas fa-arrow-up text-white'></i>
    </div>
    <div class='flex-1 mx-2'>
      <template v-for='(item,i) in parts'>
                <span
                    v-if='i !== 0 && item'
                >
                    &#62;
                </span>
        <span
            class='underline cursor-pointer p-2 rounded-md'
            v-if='item || i === 0'
            @click='i === 0 ? goToHome() : goToAPreviousDirectory(i)'
            @dragenter='(event) => onDragEnter(event, i)'
            @dragleave='(event) => onDragLeave(event, i)'
            @dragover='(event) => event.preventDefault()'
            @drop='(event) => onDrop(event,i)'
        >
                    {{ i === 0 ? 'Home' : item }}
                </span>
      </template>
    </div>
    <options></options>
    <buttons></buttons>
  </div>

</template>

<script lang='ts'>
import {computed, defineComponent, onBeforeMount, ref} from 'vue';
import {
  currentDirectory,
  goToHome,
  goToAPreviousDirectory,
  goBack,
  searchDir,
  searchDirValue,
  searchResults, isDraggingFiles, moveFiles, selectedAction, Action, getToken, sharedDir
} from '@/store/fileBrowserStore';
import Dialog from '@/components/Dialog.vue';
import MainActionButtons from '@/components/fileBrowser/MainActionButtons.vue';
import SelectedOptions from '@/components/fileBrowser/SelectedOptions.vue';
import Button from '@/components/Button.vue';
import {sendMessageObject, usechatsActions, usechatsState} from '@/store/chatStore';
import {useSocketActions} from '@/store/socketStore';
import {SystemMessageTypes, MessageTypes} from '@/types';
import {createNotification} from '@/store/notificiationStore';

const {chats} = usechatsState();
const {retrievechats, sendMessage} = usechatsActions();

export default defineComponent({
  name: 'TopBar',
  components: { Button, jdialog: Dialog, options: SelectedOptions, buttons: MainActionButtons },
  setup() {
    let debounce;

    const parts = computed(() => currentDirectory.value.split('/'));
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

    const onDragEnter = (e: Event, i: number) => {
      if (!isDraggingFiles.value || !e || !e.target || i === parts.value.length - 1) return;
      (e.target as HTMLElement).classList.add('bg-accent');
      (e.target as HTMLElement).classList.add('text-white');
    };

    const onDragLeave = (e: Event, i: number) => {
      if (!isDraggingFiles.value || !e || !e.target || i === parts.value.length - 1) return;
      (e.target as HTMLElement).classList.remove('bg-accent');
      (e.target as HTMLElement).classList.remove('text-white');
    };

    const onDrop = (e: Event, i: number) => {
      if (!isDraggingFiles.value || !e || !e.target || i === parts.value.length - 1) return;
      let path = '/';
      if (i > 0) {
        const parts = currentDirectory.value.split('/');
        parts.splice(i + 1);
        path = parts.join('/');
      }
      (e.target as HTMLElement).classList.remove('bg-accent');
      (e.target as HTMLElement).classList.remove('text-white');
      moveFiles(path);
      selectedPaths.value = [];
    };

    return {
      goToHome,
      goBack,
      goToAPreviousDirectory,
      currentDirectory,
      searchDirValue,
      searchDir,
      searchResults,
      debounceSearch,
      isDraggingFiles,
      onDragEnter,
      onDragLeave,
      onDrop,
      parts,
      createNotification,
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