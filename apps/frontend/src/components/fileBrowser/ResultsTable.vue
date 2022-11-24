<template>
    <div class="h-full overflow-y-auto px-2">
        <div class="overflow-x-auto">
            <div class="align-middle inline-block min-w-full">
                <div class="shadow overflow-hidden sm:rounded-lg">
                    <div ref="hiddenItems" class="absolute hiddenItems">
                        <div ref="ghostImage" class="bg-white p-2">
                            Moving {{ selectedPaths.length }} selected File(s)
                        </div>
                    </div>
                    <table
                        v-if="fileBrowserTypeView === 'LIST'"
                        :key="currentDirectory"
                        class="min-w-full divide-y divide-gray-200"
                        @dragenter="onDragEnterParent"
                        @dragleave="onDragLeaveParent"
                    >
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    scope="col"
                                >
                                    <input
                                        :checked="
                                            currentDirectoryContent?.length === selectedPaths?.length &&
                                            currentDirectoryContent?.length !== 0
                                        "
                                        class="h-auto w-auto"
                                        type="checkbox"
                                        @change="el => handleAllSelect(el.target.checked)"
                                    />
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    scope="col"
                                >
                                    Name
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    scope="col"
                                >
                                    Extension
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    scope="col"
                                >
                                    Size
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    scope="col"
                                >
                                    Last Modified
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-if="searchResults === 'None'">
                                <td class="px-6 py-4 whitespace-nowrap">No Search results for {{ searchDirValue }}</td>
                                <td class="px-6 py-4 whitespace-nowrap"></td>
                                <td class="px-6 py-4 whitespace-nowrap"></td>
                                <td class="px-6 py-4 whitespace-nowrap"></td>
                            </tr>
                            <tr
                                v-for="item in searchResults"
                                v-if="searchResults !== 'None'"
                                :key="item.fullName"
                                :class="{
                                    'bg-gray-300': isSelected(item),
                                }"
                                class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                draggable="true"
                                @click.stop="handleSelect(item)"
                                @dblclick="emit('itemClicked', item)"
                                @dragover="event => onDragOver(event, item)"
                                @dragstart="event => onDragStart(event, item)"
                                @dragleave="event => onDragLeave(event)"
                                @drop="() => onDrop(item)"
                            >
                                <td class="px-6 py-4 whitespace-nowrap hidden">
                                    <input
                                        :checked="
                                            selectedPaths.some(
                                                x =>
                                                    x.fullName === item.fullName &&
                                                    x.extension === item.extension &&
                                                    x.path === item.path
                                            )
                                        "
                                        class="h-auto w-auto"
                                        type="checkbox"
                                    />
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex flex-row items-center text-md">
                                        <div class="mr-3 w-7 text-center">
                                            <i
                                                :class="
                                                    getIcon(item.isDirectory, item.fileType) +
                                                    ' ' +
                                                    getIconColor(item.isDirectory, item.fileType)
                                                "
                                                class="fa-2x"
                                            ></i>
                                        </div>
                                        <div class="flex flex-col items-start py-1">
                                            <span
                                                class="text-md hover:underline cursor-pointer"
                                                @click.stop="emit('itemClicked', item)"
                                            >
                                                {{ item.name }}
                                            </span>
                                            <span
                                                class="text-xs opacity-50 cursor-pointer hover:underline w-1/2"
                                                @click="goToFileDirectory(item)"
                                                :title="item.path"
                                            >
                                                {{ truncatePath(item.path) }}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ getFileExtension(item) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ getFileSize(item) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ getFileLastModified(item) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <!-- GRID -->
                    <!-- Local filebrowser -->
                    <ul
                        v-if="fileBrowserTypeView === 'GRID'"
                        class="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 xl:gap-x-6 mt-4"
                        role="list"
                    >
                        <p
                            v-if="searchResults === 'None'"
                            class="px-6 py-4 whitespace-nowrap col-span-12 text-base font-medium text-center text-gray-800 flex justify-center flex-col"
                        >
                            No items in this folder
                            <span class="mt-4 underline cursor-pointer" @click="goBack">Go back</span>
                        </p>
                        <li
                            v-for="item in searchResults"
                            v-if="searchResults !== 'None'"
                            :key="item.fullName"
                            :title="item.fullName"
                            class="relative"
                            draggable="true"
                            @click.stop="handleSelect(item)"
                            @dblclick="emit('itemClicked', item)"
                            @dragover="event => onDragOver(event, item)"
                            @dragstart="event => onDragStart(event, item)"
                            @dragleave="event => onDragLeave(event)"
                            @drop="() => onDrop(item)"
                        >
                            <div
                                :class="{ 'bg-gray-200': isSelected(item), 'bg-white': !isSelected(item) }"
                                class="group w-full aspect-w-12 aspect-h-4 rounded-lg border-2 hover:bg-gray-200 transition duration:200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden flex justify-center items-center"
                            >
                                <div class="flex justify-start items-center cursor-pointer px-4">
                                    <i
                                        :key="item.name"
                                        :class="
                                            getIcon(item.isDirectory, item.fileType) +
                                            ' ' +
                                            getIconColor(item.isDirectory, item.fileType)
                                        "
                                        class="fa-lg"
                                    ></i>
                                    <p class="ml-4 text-sm font-medium text-gray-900 truncate pointer-events-none">
                                        {{ item.name
                                        }}{{ getFileExtension(item) === '-' ? '' : `.${getFileExtension(item)}` }}
                                    </p>
                                </div>
                            </div>

                            <p class="hidden text-sm font-medium text-gray-500 pointer-events-none">
                                {{ getFileLastModified(item) }}
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {
        currentDirectory,
        currentDirectoryContent,
        searchResults,
        searchDirValue,
        selectedPaths,
        getFileLastModified,
        getFileExtension,
        getFileSize,
        handleAllSelect,
        truncatePath,
        isSelected,
        selectItem,
        deselectItem,
        getIconColor,
        getIcon,
        PathInfoModel,
        goToFileDirectory,
        fileBrowserTypeView,
        isDraggingFiles,
        equals,
        moveFiles,
    } from '@/store/fileBrowserStore';
    import { useRouter } from 'vue-router';
    import { ref } from 'vue';

    const router = useRouter();
    const emit = defineEmits(['itemClicked']);
    const hiddenItems = ref<HTMLDivElement>();

    const handleSelect = (item: PathInfoModel) => {
        if (!selectedPaths.value.includes(item)) {
            selectItem(item);
            return;
        }
        if (selectedPaths.value.length === 1 && selectedPaths.value[0] === item) {
            emit('itemClicked', item);
            return;
        }
        deselectItem(item);
    };

    const ghostImage = ref<HTMLDivElement>();

    const onDragStart = (event, item) => {
        isDraggingFiles.value = true;
        if (!selectedPaths.value.includes(item)) selectItem(item);
        event.dataTransfer.setDragImage(ghostImage.value, 0, 0);
    };

    const dragOverItem = ref<PathInfoModel>();

    const onDragOver = (event: Event, item: PathInfoModel) => {
        dragOverItem.value = item;
        (event.target as Element).classList.add('bg-gray-200');
    };

    const onDragLeave = (event: Event) => {
        (event.target as Element).classList.remove('bg-gray-200');
    };

    const canBeDropped = (item: PathInfoModel) => {
        return item.isDirectory && selectedPaths.value.findIndex(x => equals(x, item)) === -1;
    };

    let tempCounter = 0;

    const onDragLeaveParent = () => {
        tempCounter--;
        if (tempCounter === 0) dragOverItem.value = undefined;
    };

    const onDragEnterParent = () => {
        tempCounter++;
    };

    const onDrop = (item: PathInfoModel) => {
        tempCounter = 0;
        if (!canBeDropped(item)) return;
        dragOverItem.value = undefined;
        moveFiles(
            item.path,
            selectedPaths.value.map(x => x.path)
        );
        selectedPaths.value = [];
    };

    const goBack = () => {
        router.go(-1);
    };
</script>

<style scoped>
    th.active {
        opacity: 1;
    }

    .hiddenItems {
        z-index: -20;
    }
</style>
