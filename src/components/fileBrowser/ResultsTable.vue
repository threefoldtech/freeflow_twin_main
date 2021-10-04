<template>
    <h1 class="p-2">Search results for {{ searchDirValue }}</h1>
    <div class="overflow-x-auto">
        <p></p>
        <div class="py-2 align-middle inline-block min-w-full">
            <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table
                    v-if="fileBrowserTypeView === 'LIST'"
                    class="min-w-full divide-y divide-gray-200"
                    :key="currentDirectory"
                >
                    <thead class="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
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
                            >
                                <input
                                    type="checkbox"
                                    class="h-auto w-auto"
                                    @change="handleAllSelect"
                                    :checked="
                                        currentDirectoryContent.length === selectedPaths.length &&
                                        currentDirectoryContent.length !== 0
                                    "
                                />
                            </th>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Name
                            </th>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Extension
                            </th>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Size
                            </th>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Last Modified
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-if="searchResults === 'None'">
                            <td class="px-6 py-4 whitespace-nowrap">No Search results for {{ searchDirValue }}!</td>
                        </tr>
                        <tr
                            v-for="item in searchResults"
                            class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                            :class="{
                                'bg-gray-100': isSelected(item),
                            }"
                            :key="item.fullName"
                            @click="handleSelect(item)"
                        >
                            <td class="px-6 py-4 whitespace-nowrap hidden">
                                <input
                                    type="checkbox"
                                    class="h-auto w-auto"
                                    :checked="
                                        selectedPaths.some(
                                            x =>
                                                x.fullName === item.fullName &&
                                                x.extension === item.extension &&
                                                x.path === item.path
                                        )
                                    "
                                />
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex flex-row items-center text-md">
                                    <div class="mr-3 w-7 text-center">
                                        <i class="fa-2x" :class="getIcon(item) + ' ' + getIconColor(item)"></i>
                                    </div>
                                    <div class="flex flex-col items-start py-1">
                                        <span
                                            class="text-md hover:underline cursor-pointer"
                                            @click="handleItemClick(item)"
                                        >
                                            {{ item.name }}
                                        </span>
                                        <span
                                            class="text-xs opacity-50 cursor-pointer hover:underline"
                                            @click="goToFileDirectory(item)"
                                        >
                                            {{ item.path }}
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
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
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

    export default defineComponent({
        name: 'ResultsTable',
        setup() {
            const router = useRouter();
            const handleItemClick = (item: PathInfoModel) => {
                if (item.isDirectory) {
                    goToFileDirectory(item);
                    return;
                }
                itemAction(item, router);
            };
            const isSelected = (item: PathInfoModel) => {
                if (!selectedPaths.value.includes(item)) return false;
                else return true;
            };
            const handleAllSelect = (val: any) => {
                if (val.target.checked) selectAll();
                else deselectAll();
            };
            const handleSelect = (item: PathInfoModel) => {
                if (!selectedPaths.value.includes(item)) selectItem(item);
                else deselectItem(item);
            };

            return {
                handleAllSelect,
                currentDirectoryContent,
                handleSelect,
                searchResults,
                isSelected,
                searchDirValue,
                currentDirectory,
                selectedPaths,
                getFileLastModified,
                getFileExtension,
                getFileSize,
                getIconColor,
                getIcon,
                handleItemClick,
                goToFileDirectory,
                fileBrowserTypeView,
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
        border-bottom: 4px solid #1f0f5b;
    }

    .arrow.desc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #1f0f5b;
    }
</style>
