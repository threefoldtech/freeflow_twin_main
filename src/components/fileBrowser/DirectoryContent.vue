<template>
    <div class='h-full overflow-y-auto'>
        <FileDropArea @send-file='uploadFiles' class='h-full'>
            <div class='absolute hiddenItems' ref='hiddenItems'>
                <div class='bg-white p-2' ref='ghostImage'>
                    Moving {{ selectedPaths.length }} selected File(s)
                </div>
            </div>
            <table class='w-full box-border'
                   :key='currentDirectory'
                   @dragleave='onDragLeaveParent'
                   @dragenter='onDragEnterParent'
            >
                <thead>
                <tr>
                    <th class='text-center w-2'>
                        <label class='px-6 py-3'>
                            <input
                                type='checkbox'
                                class='h-auto w-auto'
                                @change='handleAllSelect'
                                :checked='currentDirectoryContent.length === selectedPaths.length && currentDirectoryContent.length !== 0'
                            ></label>
                    </th>
                    <th :class="{active: 'name' === currentSort}" class='text-left cursor-pointer select-none'
                        @click="sortAction('name')">Name
                        <span :class='orderClass'>
                    </span>
                    </th>
                    <th :class="{active: 'extension' === currentSort}" class='text-left cursor-pointer select-none'
                        @click="sortAction('extension')">Extension
                        <span :class='orderClass'>
                    </span>
                    </th>
                    <th :class="{active: 'size' === currentSort}" class='text-left cursor-pointer select-none'
                        @click="sortAction('size')">Size
                        <span :class='orderClass'>
                    </span>
                    </th>
                    <th :class="{active: 'lastModified' === currentSort}" class='text-left cursor-pointer select-none'
                        @click="sortAction('lastModified')">Last Modified
                        <span :class='orderClass'>
                    </span>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-if='currentDirectoryContent.length === 0'>
                    <td colspan='5' class='italic text-gray-500 text-center'>Empty directory</td>
                </tr>
                <tr
                    v-for='item in sortContent()'
                    class='hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300'
                    :class='{
                        "bg-accent": highlight(item)
                    }'
                    :key='item.fullName'
                    @click='handleSelect(item)'
                    draggable='true'
                    @dragstart='(event) => onDragStart(event, item)'
                    @dragover='(event) => onDragOver(event, item)'
                    @drop='() => onDrop(item)'
                >
                    <td class='text-center w-2'>
                        <input
                            type='checkbox'
                            class='h-auto w-auto'
                            :checked='selectedPaths.some(x => x.fullName === item.fullName && x.extension === item.extension  && x.path === item.path)'>
                    </td>
                    <td>
                        <div class='flex flex-row items-center text-md'>
                            <div class='mr-3 w-7'>
                                <i class='fa-2x'
                                   :class='getIcon(item)+ " " + getIconColor(item)'
                                ></i>
                            </div>
                            <span
                                class='hover:underline'
                                @click.stop='handleItemClick(item)'
                            >
                            {{ item.name }}
                        </span>
                        </div>
                    </td>
                    <td>{{ getFileExtension(item) }}</td>
                    <td>{{ getFileSize(item) }}</td>
                    <td>{{ getFileLastModified(item) }}</td>

                </tr>
                </tbody>
            </table>
        </FileDropArea>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, ref } from 'vue';
    import {
        currentDirectory,
        currentDirectoryContent,
        itemAction,
        PathInfoModel, selectItem, deselectAll, selectAll,
        selectedPaths, deselectItem, sortContent, sortAction, currentSort, currentSortDir,
        getFileLastModified, getFileExtension, getFileSize, getIconColor, getIcon
        , uploadFiles, equals, moveFiles, isDraggingFiles,
    } from '@/store/fileBrowserStore';
    import { useRouter } from 'vue-router';
    import FileDropArea from '@/components/FileDropArea.vue';

    export default defineComponent({
        name: 'DirectoryContent',
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
            const handleSelect = (item: PathInfoModel) => {
                if (!selectedPaths.value.includes(item))
                    selectItem(item);
                else
                    deselectItem(item);
            };

            const handleAllSelect = (val: any) => {
                if (val.target.checked)
                    selectAll();
                else
                    deselectAll();
            };

            const handleItemClick = (item: PathInfoModel) => {
                itemAction(item, router);
            };

            const onDragStart = (event, item) => {
                isDraggingFiles.value = true;
                if (!selectedPaths.value.includes(item))
                    selectItem(item);
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
                if (tempCounter === 0)
                    dragOverItem.value = undefined;
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
                moveFiles(item.path, selectedPaths.value.map(x => x.path));
                selectedPaths.value = [];
            };

            const onDragEnd = () => {
                isDraggingFiles.value = false;
            };

            return {
                handleSelect,
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