<template>
    <div :class="{ hidden: sharedDir }" class="mx-2">
      <MainActionButton  @openDialog="showCreateFolderDialog = true"
                         title="New folder" />
        <MainActionButton  @openDialog="showCreateFileDialog = true"
                         title="Upload file(s)" />
    </div>
    <CreateFolderDialog :showCreateFolderDialog="showCreateFolderDialog" @updateModal="bool => showCreateFolderDialog = bool"  />
    <UploadFileDialog :showCreateFileDialog="showCreateFileDialog" @updateModal="bool => showCreateFileDialog = bool" />
</template>

<script lang="ts" setup>
    import { ref } from 'vue';
    import { sharedDir } from '@/store/fileBrowserStore';
    import MainActionButton from '@/components/fileBrowser/MainActionButton.vue'
    import CreateFolderDialog from '@/components/fileBrowser/Dialogs/CreateFolderDialog.vue'
    import UploadFileDialog from '@/components/fileBrowser/Dialogs/UploadFileDialog.vue'

    const showCreateFolderDialog = ref(false);
    const showCreateFileDialog = ref(false);

</script>

<style scoped></style>
