<template>
    <div class='flex flex-col mx-2'>
        <div class='overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div class='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
                <div class='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
                    <FileDropArea class='h-full' @send-file='uploadFiles'>
                        <div ref='hiddenItems' class='absolute hiddenItems'>
                            <div ref='ghostImage' class='bg-white p-2'>
                                Moving {{ selectedPaths.length }} selected File(s)
                            </div>
                        </div>
                        <table
                            :key='currentDirectory'
                            class='min-w-full divide-y divide-gray-200'
                            @dragenter='onDragEnterParent'
                            @dragleave='onDragLeaveParent'
                        >
                            <thead class='bg-gray-50'>
                            <tr>
                                <th
                                    class='
                                            hidden
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        '
                                    scope='col'
                                >
                                    <input
                                        :checked='
                                                currentDirectoryContent.length === selectedPaths.length &&
                                                currentDirectoryContent.length !== 0
                                            '
                                        class='h-auto w-auto'
                                        type='checkbox'
                                        @change='handleAllSelect'
                                    />
                                </th>
                                <th
                                    :class="{ active: 'name' === currentSort }"
                                    class='
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        '
                                    scope='col'
                                    @click="sortAction('name')"
                                >
                                    Name
                                    <span :class='orderClass'> </span>
                                </th>
                                <th
                                    :class="{ active: 'extension' === currentSort }"
                                    class='
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        '
                                    scope='col'
                                    @click="sortAction('extension')"
                                >
                                    Extension
                                    <span :class='orderClass'> </span>
                                </th>
                                <th
                                    :class="{ active: 'size' === currentSort }"
                                    class='
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        '
                                    scope='col'
                                    @click="sortAction('size')"
                                >
                                    Size
                                    <span :class='orderClass'> </span>
                                </th>
                                <th
                                    :class="{ active: 'lastModified' === currentSort }"
                                    class='
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        '
                                    scope='col'
                                    @click="sortAction('lastModified')"
                                >
                                    Last Modified
                                    <span :class='orderClass'> </span>
                                </th>
                            </tr>
                            </thead>
                            <tbody class='bg-white divide-y divide-gray-200'>
                            <tr v-if='currentDirectoryContent.length === 0'>
                                <td class='px-6 py-4 whitespace-nowrap'>Empty directory</td>
                                <td class='px-6 py-4 whitespace-nowrap'>-</td>
                                <td class='px-6 py-4 whitespace-nowrap'>-</td>
                                <td class='px-6 py-4 whitespace-nowrap'>-</td>
                            </tr>
                            <!-- File Share Folder -->
                            <tr v-if="currentDirectory === '/'">
                                <td class='px-6 py-4 whitespace-nowrap hidden'></td>
                                <td class='px-6 py-4 whitespace-nowrap' @click='goToShared()'>
                                    <div class='flex flex-row items-center text-md'>
                                        <div class='mr-3 w-7 text-center'>
                                            <i class='fas fa-share-alt-square fa-2x text-blue-400'></i>
                                        </div>
                                        <span class='hover:underline cursor-pointer'> Files shared with me </span>
                                    </div>
                                </td>
                                <td class='px-6 py-4 whitespace-nowrap'>-</td>
                                <td class='px-6 py-4 whitespace-nowrap'>-</td>
                                <td class='px-6 py-4 whitespace-nowrap'>-</td>
                            </tr>
                            <tr
                                v-for='item in sortContent()'
                                :key='item.fullName'
                                :class="{
                                        'bg-accent': highlight(item),
                                        'bg-gray-100': isSelected(item),
                                    }"
                                class='hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300'
                                draggable='true'
                                @click='handleSelect(item)'
                                @dragover='event => onDragOver(event, item)'
                                @dragstart='event => onDragStart(event, item)'
                                @drop='() => onDrop(item)'
                            >
                                <td class='px-6 py-4 whitespace-nowrap hidden'>
                                    <input
                                        :checked='
                                                selectedPaths.some(
                                                    x =>
                                                        x.fullName === item.fullName &&
                                                        x.extension === item.extension &&
                                                        x.path === item.path
                                                )
                                            '
                                        class='h-auto w-auto'
                                        type='checkbox'
                                    />
                                </td>
                                <td class='px-6 py-4 whitespace-nowrap'>
                                    <div class='flex flex-row items-center text-md'>
                                        <div class='mr-3 w-7 text-center'>
                                            <i :class="getIcon(item) + ' ' + getIconColor(item)" class='fa-2x'></i>
                                        </div>
                                        <span class='hover:underline' @click.stop='handleItemClick(item)'>
                                                {{ item.name }}
                                            </span>
                                    </div>
                                </td>
                                <td class='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {{ getFileExtension(item) }}
                                </td>
                                <td class='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {{ getFileSize(item) }}
                                </td>
                                <td class='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {{ getFileLastModified(item) }}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </FileDropArea>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, onBeforeMount, ref } from 'vue';
    import {
        currentDirectory,
        currentDirectoryContent,
        itemAction,
        PathInfoModel,
        selectItem,
        deselectAll,
        selectAll,
        selectedPaths,
        deselectItem,
        sortContent,
        sortAction,
        currentSort,
        currentSortDir,
        getFileLastModified,
        getFileExtension,
        getFileSize,
        getIconColor,
        getIcon,
        uploadFiles,
        equals,
        moveFiles,
        isDraggingFiles,
        sharedDir,
        sharedContent,
        getSharedContent,
    } from '@/store/fileBrowserStore';
    import { useRouter } from 'vue-router';
    import FileDropArea from '@/components/FileDropArea.vue';
    import { useSocketActions } from '@/store/socketStore';
    import { useAuthState } from '@/store/authStore';

    export default defineComponent({
        name: 'FileTable',
        computed: {
            orderClass() {
                return this.currentSortDir === 'asc' ? 'arrow asc' : 'arrow desc';
            },
        },
        components: { FileDropArea },
        setup() {
            const hiddenItems = ref<HTMLDivElement>();
            const ghostImage = ref<HTMLDivElement>();
            const dragOverItem = ref<PathInfoModel>();
            let tempCounter = 0;
            const router = useRouter();
            const { user } = useAuthState();
            onBeforeMount(() => {
                const { initializeSocket } = useSocketActions();
                initializeSocket(user.id.toString());
            });

            const handleSelect = (item: PathInfoModel) => {
                if (!selectedPaths.value.includes(item)) selectItem(item);
                else deselectItem(item);
            };

            const isSelected = (item: PathInfoModel) => {
                if (!selectedPaths.value.includes(item)) return false;
                else return true;
            };

            const handleAllSelect = (val: any) => {
                if (val.target.checked) selectAll();
                else deselectAll();
            };

            const handleItemClick = (item: PathInfoModel) => {
                itemAction(item, router);
            };

            const onDragStart = (event, item) => {
                isDraggingFiles.value = true;
                if (!selectedPaths.value.includes(item)) selectItem(item);
                event.dataTransfer.setDragImage(ghostImage.value, 0, 0);
            };

            const onDragOver = (event: Event, item: PathInfoModel) => {
                dragOverItem.value = item;
            };

            const canBeDropped = (item: PathInfoModel) => {
                return item.isDirectory && selectedPaths.value.findIndex(x => equals(x, item)) === -1;
            };

            const onDragLeaveParent = () => {
                tempCounter--;
                if (tempCounter === 0) dragOverItem.value = undefined;
            };

            const onDragEnterParent = () => {
                tempCounter++;
            };

            const highlight = (item: PathInfoModel) => {
                return equals(item, dragOverItem.value) && canBeDropped(item);
            };

            const onDrop = (item: PathInfoModel) => {
                tempCounter = 0;
                if (!canBeDropped(item)) return;
                dragOverItem.value = undefined;
                moveFiles(
                    item.path,
                    selectedPaths.value.map(x => x.path),
                );
                selectedPaths.value = [];
            };

            const onDragEnd = () => {
                isDraggingFiles.value = false;
            };
            const goToShared = async () => {
                sharedDir.value = true;
                await getSharedContent();
            };

            return {
                handleSelect,
                isSelected,
                handleAllSelect,
                handleItemClick,
                currentDirectoryContent,
                currentDirectory,
                selectedPaths,
                sortContent,
                sortAction,
                currentSort,
                currentSortDir,
                uploadFiles,
                getFileLastModified,
                getFileExtension,
                getFileSize,
                getIconColor,
                getIcon,
                onDragStart,
                hiddenItems,
                ghostImage,
                onDragOver,
                equals,
                dragOverItem,
                highlight,
                onDrop,
                onDragEnterParent,
                onDragLeaveParent,
                onDragEnd,
                sharedDir,
                sharedContent,
                goToShared,
            };
        },
    });
</script>

<style scoped>
    th.active .arrow {
        opacity: 1;
    }

    .arrow {
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 0;
        margin-left: 5px;
        opacity: 0;
    }

    .arrow.asc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 4px solid #42b983;
    }

    .arrow.desc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #42b983;
    }

    .hiddenItems {
        z-index: -20;
    }
</style>
