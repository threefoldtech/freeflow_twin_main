<template>
    <div>
        <h1 class="p-2">Search results for {{ searchDirValue }}</h1>
        <div class="overflow-x-auto">
            <div class="py-2 align-middle inline-block min-w-full">
                <ViewSelect />
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table :key="currentDirectory" class="min-w-full divide-y divide-gray-200">
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
                                >
                                    Name
                                </th>
                                <th
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
                                >
                                    Extension
                                </th>
                                <th
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
                                >
                                    Size
                                </th>
                                <th
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
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import ViewSelect from '@/components/fileBrowser/ViewSelect.vue';
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
    const handleItemClick = (item: PathInfoModel) => {
        if (item.isDirectory) {
            goToFileDirectory(item);
            return;
        }
        itemAction(item, router);
    };
    const isSelected = (item: PathInfoModel) => {
        return selectedPaths.value.includes(item);
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
