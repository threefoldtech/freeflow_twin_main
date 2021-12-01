<template>
  <Dialog :modelValue="showShareDialog" @update-model-value="$emit('updateModel', false)" :noActions='true'>
    <template v-slot:title>
      <h1 class="text-center">Share files</h1>
    </template>
    <div class="flex w-full items-center rounded-xl bg-gray-100 mb-2" :key="selectedTab">
      <div class="flex-grow" v-for="(tab, index) in tabs" :key="`${tab}-${index}`">
        <button
            @click="selectedTab = index"
            class="w-full p-2 rounded-xl"
            :class="{ 'bg-primary text-white': index === selectedTab }"
        >
          {{ tab }}
        </button>
      </div>
    </div>
    <ShareChatTable v-if="selectedTab === 0" :data="chats"></ShareChatTable>
    <EditShare v-if="selectedTab === 1" :selectedFile="selectedPaths[0]"></EditShare>
  </Dialog>
</template>

<script setup lang="ts">
import {selectedPaths, selectedTab} from "@/store/fileBrowserStore";
import Dialog from '@/components/Dialog.vue';
import ShareChatTable from '@/components/fileBrowser/OptionsSelectedItem/ShareChatTable.vue';
import EditShare from '@/components/fileBrowser/OptionsSelectedItem/EditShare.vue';
import {onBeforeMount} from "vue";
import {usechatsActions, usechatsState} from "@/store/chatStore";

const { chats } = usechatsState();
const { retrievechats, sendMessage } = usechatsActions();

interface IProps{
  showShareDialog: boolean;
}

const props = defineProps<IProps>()

const emit = defineEmits(['updateModel'])

onBeforeMount(() => {
  retrievechats();
});

const tabs = ['Create shares', 'Edit shares'];

</script>

<style scoped>

</style>