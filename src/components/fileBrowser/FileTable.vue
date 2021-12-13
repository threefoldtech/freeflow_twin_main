<template>
  <v-contextmenu ref="contextmenu-filebrowser-item-local">
    <v-contextmenu-item @click="() => {
                                    triggerWatchOnRightClickItem = !triggerWatchOnRightClickItem;
                                    rightClickItemAction = RIGHT_CLICK_ACTIONS_FILEBROWSER_ITEM.SHARE;
                                  }">Share</v-contextmenu-item>
    <v-contextmenu-item @click="() => {
                                    triggerWatchOnRightClickItem = !triggerWatchOnRightClickItem;
                                    rightClickItemAction = RIGHT_CLICK_ACTIONS_FILEBROWSER_ITEM.DOWNLOAD;
                                  }">Download</v-contextmenu-item>
    <v-contextmenu-item @click="() => {
                                    triggerWatchOnRightClickItem = !triggerWatchOnRightClickItem;
                                    rightClickItemAction = RIGHT_CLICK_ACTIONS_FILEBROWSER_ITEM.RENAME
                                  }">Rename</v-contextmenu-item>
    <v-contextmenu-item @click="() => {
                                    triggerWatchOnRightClickItem = !triggerWatchOnRightClickItem;
                                    rightClickItemAction = RIGHT_CLICK_ACTIONS_FILEBROWSER_ITEM.DELETE
                                  }">Delete</v-contextmenu-item>
  </v-contextmenu>
    <div class="flex flex-col mx-2">
        <div class="overflow-x-auto">
            <div class="py-2 px-4 align-middle inline-block min-w-full">
                <div class="flex justify-end mb-2">
                    <ViewSelect />
                </div>
                <div class="overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <FileDropArea class="h-full" @click.stop @send-file="uploadFiles">
                        <div ref="hiddenItems" class="absolute hiddenItems">
                            <div ref="ghostImage" class="bg-white p-2">
                                Moving {{ selectedPaths.length }} selected File(s)
                            </div>
                        </div>
                        <table
                            v-if="fileBrowserTypeView === 'LIST'"
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
                                <tr v-if="currentDirectoryContent.length === 0">
                                    <td class="px-6 py-4 whitespace-nowrap">Empty directory</td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                </tr>
                                <!-- <tr
                                    v-for="item in chatsWithAttachments"
                                    class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                    :class="{
                                        'bg-gray-100': isSelected(item),
                                    }"
                                    @click="goToAttachmentsFromChat(item)"
                                    :key="item"
                                >
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex flex-row items-center text-md">
                                            <div class="mr-3 w-7 text-center">
                                                <i
                                                    :key="item"
                                                    :class="{
                                                        'text-gray-600 fa-2x fas fa-users': item,
                                                        'text-gray-600 fa-2x fas fa-user': !item,
                                                    }"
                                                ></i>
                                            </div>
                                            <div class="flex flex-row items-center text-md">
                                                <span class="hover:underline cursor-pointer">{{ item }} </span>
                                            </div>

                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                </tr> -->

                                <!-- File Share Folder -->
                                <tr v-if="currentDirectory === '/' && !savedAttachments">
                                    <td class="px-6 py-4 whitespace-nowrap hidden"></td>
                                    <td class="px-6 py-4 whitespace-nowrap" @click="goToShared()">
                                        <div class="flex flex-row items-center text-md">
                                            <div class="mr-3 w-7 text-center">
                                                <i class="fas fa-share-alt-square fa-2x text-blue-400"></i>
                                            </div>
                                            <span class="hover:underline cursor-pointer">Shared with me </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                </tr>
                                <tr v-if="currentDirectory === '/' && !savedAttachments">
                                    <td class="px-6 py-4 whitespace-nowrap hidden"></td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap"
                                        @click="router.push({ name: 'savedAttachments' })"
                                    >
                                        <div class="flex flex-row items-center text-md">
                                            <div class="mr-3 w-7 text-center">
                                                <i class="fas fa-share-alt-square fa-2x text-blue-400"></i>
                                            </div>
                                            <span class="hover:underline cursor-pointer">Saved attachments</span>                                       
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 whitespace-nowrap">-</td>
                                </tr>

                                <tr
                                    v-for="item in sortContent()"
                                    :key="item.fullName"
                                    :class="{
                                        'bg-gray-300': isSelected(item),
                                    }"
                                    class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                    draggable="true"
                                    @click="handleSelect(item)"
                                    @dragover="event => onDragOver(event, item)"
                                    @dragstart="event => onDragStart(event, item)"
                                    @drop="() => onDrop(item)"
                                    @mousedown.right="setCurrentRightClickedItem(item)"
                                    v-contextmenu:contextmenu-filebrowser-item-local
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
                                                <i :class="getIcon(item) + ' ' + getIconColor(item)" class="fa-2x"></i>
                                            </div>
                                            <span class="hover:underline" @click.stop="handleItemClick(item)">
                                                {{ item.name }}
                                            </span>
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
                            v-else
                            class="
                                grid grid-cols-2
                                gap-x-2 gap-y-4
                                sm:grid-cols-4 sm:gap-x-4
                                lg:grid-cols-6
                                xl:grid-cols-8
                                2xl:grid-cols-10
                                xl:gap-x-6
                                mt-4
                            "
                            role="list"
                        >
                            <p
                                v-if="sortContent().length === 0"
                                class="
                                    px-6
                                    py-4
                                    whitespace-nowrap
                                    col-span-12
                                    text-base
                                    font-medium
                                    text-center text-gray-800
                                    flex
                                    justify-center
                                    flex-col
                                "
                            >
                                No items in this folder
                                <span class="mt-4 underline cursor-pointer" @click="goBack">Go back</span>
                            </p>
                            <li v-if="currentDirectory === '/' && route.name === 'quantum'" title="Shared folder">
                                <div
                                    class="
                                        group
                                        w-full
                                        aspect-w-12 aspect-h-4
                                        border-2
                                        bg-white
                                        rounded-md
                                        hover:bg-gray-200
                                        transition
                                        duration:200
                                        focus-within:ring-2
                                        focus-within:ring-offset-2
                                        focus-within:ring-offset-gray-100
                                        focus-within:ring-indigo-500
                                        overflow-hidden
                                        flex
                                        justify-start
                                        items-center
                                    "
                                    @click="goToShared()"
                                >
                                    <div class="flex justify-start items-center cursor-pointer px-2">
                                        <i class="fas fa-share-alt-square fa-lg text-blue-400"></i>
                                        <p
                                            class="
                                                block
                                                text-sm
                                                font-medium
                                                text-gray-900
                                                truncate
                                                pointer-events-none
                                                ml-4
                                            "
                                        >
                                            Shared with me
                                        </p>
                                        <button class="absolute inset-0 focus:outline-none" type="button"></button>
                                    </div>
                                </div>
                            </li>
                            <li v-if="currentDirectory === '/' && route.name === 'quantum'" title="Shared folder">
                                <div
                                    class="
                                        group
                                        w-full
                                        aspect-w-12 aspect-h-4
                                        border-2
                                        bg-white
                                        rounded-md
                                        hover:bg-gray-200
                                        transition
                                        duration:200
                                        focus-within:ring-2
                                        focus-within:ring-offset-2
                                        focus-within:ring-offset-gray-100
                                        focus-within:ring-indigo-500
                                        overflow-hidden
                                        flex
                                        justify-start
                                        items-center
                                    "
                                    @click="goToFilesInChat(true)"
                                >
                                    <div class="flex justify-start items-center cursor-pointer px-2">
                                        <i class="fas fa-share-alt-square fa-lg text-blue-400"></i>
                                        <p
                                            class="
                                                block
                                                text-sm
                                                font-medium
                                                text-gray-900
                                                truncate
                                                pointer-events-none
                                                ml-4
                                            "
                                        >
                                            Downloaded attachments
                                        </p>
                                        <button class="absolute inset-0 focus:outline-none" type="button"></button>
                                    </div>
                                </div>
                            </li>
                            <li
                                v-for="item in sortContent()"
                                :key="item.fullName"
                                :title="item.fullName"
                                class="relative"
                                draggable="true"
                                @click="handleSelect(item)"
                                @dblclick="handleItemClick(item)"
                                @dragover="event => onDragOver(event, item)"
                                @dragstart="event => onDragStart(event, item)"
                                @drop="() => onDrop(item)"
                                @mousedown.right="setCurrentRightClickedItem(item)"
                                v-contextmenu:contextmenu-filebrowser-item-local
                            >
                                <div
                                    :class="{ 'bg-gray-200': isSelected(item), 'bg-white': !isSelected(item) }"
                                    class="
                                        group
                                        w-full
                                        aspect-w-12 aspect-h-4
                                        rounded-lg
                                        border-2
                                        hover:bg-gray-200
                                        transition
                                        duration:200
                                        focus-within:ring-2
                                        focus-within:ring-offset-2
                                        focus-within:ring-offset-gray-100
                                        focus-within:ring-indigo-500
                                        overflow-hidden
                                        flex
                                        justify-center
                                        items-center
                                    "
                                >
                                    <div class="flex justify-start items-center cursor-pointer px-4">
                                        <i
                                            :key="item.name"
                                            :class="getIcon(item) + ' ' + getIconColor(item)"
                                            class="fa-lg"
                                        ></i>
                                        <p
                                            class="
                                                block
                                                text-sm
                                                font-medium
                                                text-gray-900
                                                truncate
                                                pointer-events-none
                                                ml-4
                                            "
                                        >
                                            {{ item.name
                                            }}{{ getFileExtension(item) === '-' ? '' : `.${getFileExtension(item)}` }}
                                        </p>
                                    </div>
                                </div>
                                <p class="hidden block text-sm font-medium text-gray-500 pointer-events-none">
                                    {{ getFileLastModified(item) }}
                                </p>
                            </li>
                        </ul>
                    </FileDropArea>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeMount, ref} from 'vue';
import ViewSelect from '@/components/fileBrowser/ViewSelect.vue';
import {
    currentDirectory,
    currentDirectoryContent,
    currentSort,
    itemAction,
    PathInfoModel,
    selectItem,
    deselectAll,
    deselectItem,
    sortContent,
    sortAction,
    currentSortDir,
    getFileLastModified,
    getFileExtension,
    getFileSize,
selectedPaths,

selectAll,
    getIconColor,
    getIcon,
    uploadFiles,
    equals,
    moveFiles,
    sharedDir,
    sharedContent,
    getSharedContent,
    searchResults,
    searchDirValue,
    currentShare,
isDraggingFiles,
    goToShared,
    fileBrowserTypeView,
    goToFilesInChat,
    savedAttachments,
} from '@/store/fileBrowserStore';
import {useRouter, useRoute} from 'vue-router';
import FileDropArea from '@/components/FileDropArea.vue';
import {useSocketActions} from '@/store/socketStore';
import {useAuthState} from '@/store/authStore';
import {
  currentRightClickedItem,
  rightClickItemAction,
  triggerWatchOnRightClickItem,
  RIGHT_CLICK_ACTIONS_FILEBROWSER_ITEM,
  RIGHT_CLICK_TYPE,
  } from '@/store/contextmenuStore'

const orderClass = computed(() => (currentSortDir.value === 'asc' ? 'arrow asc' : 'arrow desc'));
    const hiddenItems = ref<HTMLDivElement>();
    const ghostImage = ref<HTMLDivElement>();
    const dragOverItem = ref<PathInfoModel>();
    let tempCounter = 0;
    const route = useRoute();
    const router = useRouter();
    
    const { user } = useAuthState();

    onBeforeMount(() => {
        const { initializeSocket } = useSocketActions();
        initializeSocket(user.id.toString());
    });

    const setCurrentRightClickedItem = (item) => {
      currentRightClickedItem.value = {
        type: RIGHT_CLICK_TYPE.LOCAL_FILE,
        data: item
      }
    }

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

const goBack = () => {
    router.go(-1);
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
