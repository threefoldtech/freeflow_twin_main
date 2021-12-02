<template>
    <div class="flex flex-col mx-2">
        <div class="overflow-x-auto">
            <div class="py-2 px-4 align-middle inline-block min-w-full">
                <div class="flex justify-end mb-2">
                    <ViewSelect />
                </div>
                <div class="overflow-hidden sm:rounded-lg">
                    <FileDropArea class="h-full" @click.stop @send-file="uploadFiles">
                        <div ref="hiddenItems" class="absolute hiddenItems">
                            <div ref="ghostImage" class="bg-white p-2">
                                Moving {{ selectedPaths.length }} selected File(s)
                            </div>
                        </div>
                        <table
                            v-if="fileBrowserTypeView === ViewType.LIST"
                            :key="currentDirectory"
                            class="min-w-full divide-y divide-gray-200 shadow"
                            @dragenter="onDragEnterParent"
                            @dragleave="onDragLeaveParent"
                        >
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="
                                            hidden
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        "
                                        scope="col"
                                    >
                                        <input
                                            :checked="
                                                currentDirectoryContent.length === selectedPaths.length &&
                                                currentDirectoryContent.length !== 0
                                            "
                                            class="h-auto w-auto"
                                            type="checkbox"
                                            @change="handleAllSelect"
                                        />
                                    </th>
                                    <th
                                        :class="{ active: 'name' === currentSort }"
                                        class="
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        "
                                        scope="col"
                                        @click="sortAction('name')"
                                    >
                                        Name
                                        <span :class="orderClass"> </span>
                                    </th>
                                    <th
                                        :class="{ active: 'extension' === currentSort }"
                                        class="
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        "
                                        scope="col"
                                        @click="sortAction('extension')"
                                    >
                                        Extension
                                        <span :class="orderClass"> </span>
                                    </th>
                                    <th
                                        :class="{ active: 'size' === currentSort }"
                                        class="
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        "
                                        scope="col"
                                        @click="sortAction('size')"
                                    >
                                        Size
                                        <span :class="orderClass"> </span>
                                    </th>
                                    <th
                                        :class="{ active: 'lastModified' === currentSort }"
                                        class="
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        "
                                        scope="col"
                                        @click="sortAction('lastModified')"
                                    >
                                        Last Modified
                                        <span :class="orderClass"> </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <TableItemEmpty v-if="currentDirectoryContent.length === 0" />
                                <TableItemPlaceholder v-if="currentDirectory === '/'" :action="() => goToShared()" :title="'Shared with me'"  />
                                <TableItemPlaceholder v-if="currentDirectory === '/'" :action="() => router.push({name: 'filesReceivedInChat'})" :title="'Files received in chat'"  />
                                <TableItemPlaceholder v-if="currentDirectory === '/'" :action="() => router.push({name: 'filesSentInChat'})" :title="'Files sent in chat'"  />
                                <TableItem v-for="item in sortContent()"
                                           :key="item.fullName"
                                           :item="item"
                                           :class="{
                                        'bg-gray-300': isSelected(item),
                                          }"
                                           class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300 cursor-pointer"
                                           draggable="true"
                                           @click="handleSelect(item)"
                                           @dragover="event => onDragOver(event, item)"
                                           @dragstart="event => onDragStart(event, item)"
                                           @drop="() => onDrop(item)"
                                />
                            </tbody>
                        </table>
                        <!-- GRID -->
                        <!-- Local filebrowser -->
                      <div  v-if="fileBrowserTypeView === ViewType.GRID">
                        <div class="flex items-center justify-between  text-gray-700 my-4 md:my-6">
                          <p class="font-semibold">Directories</p>
                          <div  class="flex items-center cursor-pointer">
                            <p class="hidden mr-1 font-medium">Name</p>
                            <GridOrderDropdown :selectedOrder="selectedOrder" :viewingOrders="viewingOrders" />
                            <div @click="sortAction(selectedOrder.value)" class="hover:bg-gray-300 transition duration-100 rounded-full p-1 ml-2"><ArrowSmDownIcon :class="{ 'rotate-180': 'asc' === currentSortDir, 'rotate-0': 'desc' === currentSortDir }" class="w-6 h-6" /></div>
                          </div>
                        </div>
                        <ul
                            v-if="fileBrowserTypeView === ViewType.GRID"
                            class="
                                grid grid-cols-filebrowser
                                gap-4
                                                       "
                            role="list"
                        >
                          <GridItemEmpty v-if="sortContent().length === 0" />
                          <GridItemPlaceholder v-if="currentDirectory === '/'" @click="goToShared()" :title="'Shared with me'" />
                          <GridItemPlaceholder v-if="currentDirectory === '/'" @click="goToFilesInChat(true)" :title="'Files received in chat'" />
                          <GridItemPlaceholder v-if="currentDirectory === '/'" @click="goToFilesInChat(false)" :title="'Files sent in chat'" />
                          <GridItem v-for="item in allDirectories"
                                    :key="item.fullName"
                                    :item="item"
                                    :title="item.fullName"
                                    class="relative"
                                    draggable="true"
                                    @click="handleSelect(item)"
                                    @dblclick="handleItemClick(item)"
                                    @dragover="event => onDragOver(event, item)"
                                    @dragstart="event => onDragStart(event, item)"
                                    @drop="() => onDrop(item)" />
                        </ul>
                      <p class="font-semibold text-gray-700 my-4 md:my-6">Files</p>
                        <ul
                            v-if="fileBrowserTypeView === ViewType.GRID"
                            class="
                                grid grid-cols-filebrowser
                                gap-4
                                                        "
                            role="list"
                        >
                          <GridItem v-for="item in allFiles"
                                    :key="item.fullName"
                                    :item="item"
                                    :title="item.fullName"
                                    class="relative"
                                    draggable="true"
                                    @click="handleSelect(item)"
                                    @dblclick="handleItemClick(item)"
                                    @dragover="event => onDragOver(event, item)"
                                    @dragstart="event => onDragStart(event, item)"
                                    @drop="() => onDrop(item)" />
                        </ul>
                      </div>
                    </FileDropArea>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, defineComponent, onBeforeMount, ref, watch} from 'vue';
    import ViewSelect from '@/components/fileBrowser/ViewSelect.vue';
    import {ArrowSmDownIcon} from "@heroicons/vue/solid";
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
        searchResults,
        searchDirValue,
        currentShare,
        goToShared,
        fileBrowserTypeView,
        goToFilesInChat,
    } from '@/store/fileBrowserStore';
    import { useRouter } from 'vue-router';
    import FileDropArea from '@/components/FileDropArea.vue';
    import { useSocketActions } from '@/store/socketStore';
    import { useAuthState } from '@/store/authStore';
    import GridItem from '@/components/fileBrowser/Grid/GridItem.vue'
    import GridItemPlaceholder from '@/components/fileBrowser/Grid/GridItemPlaceholder.vue'
    import TableItemPlaceholder from '@/components/fileBrowser/Table/TableItemPlaceholder.vue'
    import TableItemEmpty from '@/components/fileBrowser/Table/TableItemEmpty.vue'
    import TableItem from '@/components/fileBrowser/Table/TableItem.vue'
    import GridItemEmpty from '@/components/fileBrowser/Grid/GridItemEmpty.vue'
    import {ViewType} from '@/store/fileBrowserStore';
    import GridOrderDropdown from "@/components/fileBrowser/Grid/GridOrderDropdown.vue"


    const orderClass = computed(() => (currentSortDir.value === 'asc' ? 'arrow asc' : 'arrow desc'));
    const hiddenItems = ref<HTMLDivElement>();
    const ghostImage = ref<HTMLDivElement>();
    const dragOverItem = ref<PathInfoModel>();
    let tempCounter = 0;
    const router = useRouter();
    const { user } = useAuthState();
    onBeforeMount(() => {
        const { initializeSocket } = useSocketActions();
        initializeSocket(user.id.toString());
    })

    const viewingOrders = [
      { name: 'Name', action: () => sortAction('name'), value: 'name' },
      { name: 'Extension', action: () => sortAction('extension'), value: 'extension' },
      { name: 'Size', action: () => sortAction('size'), value: 'size' },
      { name: 'Last updated', action: () => sortAction('lastModified'), value: 'lastModified' },
    ]

    const selectedOrder = ref(viewingOrders[0])

    watch([currentSort, currentSortDir],() => {
      selectListItem()
    })

    onBeforeMount(() => {
      selectListItem()
    })

    const selectListItem = () => {
      selectedOrder.value = viewingOrders.filter(order => order.value === currentSort.value)[0]
    }

    const allDirectories = computed(() => {
      return sortContent().filter(item => item.isDirectory)
      //return currentDirectoryContent.value.filter(item => item.isDirectory)
    })
    const allFiles = computed(() => {
      return sortContent().filter(item => !item.isDirectory)
    })

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
            selectedPaths.value.map(x => x.path)
        );
        selectedPaths.value = [];
    };

    const onDragEnd = () => {
        isDraggingFiles.value = false;
    };

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
        border-bottom: 4px solid #1f0f5b;
    }

    .arrow.desc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #1f0f5b;
    }

    .hiddenItems {
        z-index: -20;
    }
</style>
