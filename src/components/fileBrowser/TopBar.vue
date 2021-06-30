<template>
    <div class='flex flex-row h-12 bg-white border border-gray-200 items-center'>
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
        <div
            v-if='selectedPaths.length > 0'
            class='mx-2'>
            <p>{{ selectedPaths.length }} File(s) selected </p>

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
            <p>Paste {{copiedFiles.length}} file(s)</p>
            <div
                @click.stop='clearClipboard'>
                <i class='fas fill-current text-red-400 fa-window-close fa-1x ml-1'></i>
            </div>
        </div>
        <div class='collapsed-bar:hidden px-2 relative'>
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
        <jdialog v-model='showDeleteDialog' @update-model-value='showDeleteDialog = false' noActions class='max-w-10'>
            <template v-slot:title class='center'>
                <h1 class='text-center'>Deleting Files</h1>
            </template>
            <div>
                Do you really want to delete {{ selectedPaths.length }} item(s)?
            </div>
            <div class='grid grid-cols-2 mt-2'>
                <button @click='deleteFiles(selectedPaths);showDeleteDialog = false;' class='bg-red-500 p-2 text-white font-bold'>
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
    </div>

</template>

<script lang='ts'>
    import { computed, defineComponent, ref } from 'vue';
    import {
        currentDirectory,
        goToHome,
        goToAPreviousDirectory,
        goBack,
        selectedPaths,
        deleteFiles,
        downloadFiles,
        copyPasteSelected,
        copiedFiles,
        clearClipboard,
        renameFile,
        searchDir,
        searchDirValue,
        searchResults, isDraggingFiles, moveFiles, selectedAction, Action
    } from '@/store/fileBrowserStore';
    import Dialog from '@/components/Dialog.vue';
    import Button from '@/components/Button.vue';

    export default defineComponent({
        name: 'TopBar',
        components: { Button, jdialog: Dialog },
        setup() {
            let debounce;
            let showDeleteDialog = ref(false);
            let showRenameDialog = ref(false);
            let newName = ref<string>('');

            const parts = computed(() => currentDirectory.value.split('/'));

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

            async function cutFiles() {
                selectedAction.value = Action.CUT
                await copyPasteSelected()
            }
            async function copyFiles() {
                selectedAction.value = Action.COPY
                await copyPasteSelected()
            }

            return {
                goToHome,
                goBack,
                goToAPreviousDirectory,
                currentDirectory,
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
                onDragEnter,
                onDragLeave,
                onDrop,
                parts,
                cutFiles,
                copyFiles
            };
        },
    });
</script>

<style scoped>

</style>