<template>
    <div class="h-full overflow-y-auto px-2">
        <div class="overflow-x-auto">
            <div class="align-middle inline-block min-w-full">
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table
                        v-if="fileBrowserTypeView === 'LIST'"
                        :key="currentDirectory"
                        class="min-w-full divide-y divide-gray-200"
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
                                        @change="handleAllSelect"
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
                                    'bg-gray-100': isSelected(item),
                                }"
                                class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                @click="handleSelect(item)"
                                @dblclick="handleItemClick(item)"
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
                                        <div class="flex flex-col items-start py-1">
                                            <span
                                                class="text-md hover:underline cursor-pointer"
                                                @click="handleItemClick(item)"
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
                        v-else
                        class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4 sm:gap-x-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 xl:gap-x-6 mt-4"
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
                            @click="handleSelect(item)"
                            @dblclick="handleItemClick(item)"
                            @dragover="event => onDragOver(event, item)"
                            @dragstart="event => onDragStart(event, item)"
                            @drop="() => onDrop(item)"
                        >
                            <div
                                :class="{ 'bg-gray-200': isSelected(item), 'bg-white': !isSelected(item) }"
                                class="group w-full aspect-w-12 aspect-h-4 rounded-lg border-2 hover:bg-gray-200 transition duration:200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden flex justify-center items-center"
                            >
                                <div class="flex justify-start items-center cursor-pointer px-4">
                                    <i
                                        :key="item.name"
                                        :class="getIcon(item) + ' ' + getIconColor(item)"
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
    import { defineComponent, watch } from 'vue';
    import {
        currentDirectory,
        currentDirectoryContent,
        searchResults,
        searchDirValue,
        selectedPaths,
        getFileLastModified,
        getFileExtension,
        getFileSize,
        selectAll,
        deselectAll,
        selectItem,
        deselectItem,
        getIconColor,
        getIcon,
        PathInfoModel,
        itemAction,
        goToFileDirectory,
        fileBrowserTypeView,
    } from '@/store/fileBrowserStore';
    import { useRouter } from 'vue-router';

    const router = useRouter();

    /*
    const handleItemClick = (item: PathInfoModel) => {
        if (item.isDirectory) {
            goToFileDirectory(item);
            return;
        }
        itemAction(item, router);
    };
     */
    const handleItemClick = (item: PathInfoModel) => {
        itemAction(item, router);
    };

    const isSelected = (item: PathInfoModel) => {
        if (!selectedPaths.value.includes(item)) return false;
        else return true;
    };
    const handleAllSelect = (val: any) => {
        if (val.target.checked) {
            selectAll();
            return;
        }
        deselectAll();
    };
    const handleSelect = (item: PathInfoModel) => {
        if (!selectedPaths.value.includes(item)) {
            selectItem(item);
            return;
        }
        deselectItem(item);
    };
    const truncatePath = str => {
        if (str.length > 30) {
            return str.substr(0, 20) + '...' + str.substr(-30);
        }
        return str;
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
</style>
