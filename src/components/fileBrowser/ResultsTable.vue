<template>
    <div class="h-full overflow-y-auto px-3">
        <h1 class="p-2">Search results for {{ searchDirValue }}</h1>
        <div class="overflow-x-auto">
            <div class="py-2 align-middle inline-block min-w-full">
                <ViewSelect />
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table
                        v-if="fileBrowserTypeView === ViewType.LIST"
                        :key="currentDirectory"
                        class="min-w-full divide-y divide-gray-200 mx-4"
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
                                            currentDirectoryContent?.length === selectedPaths?.length &&
                                            currentDirectoryContent?.length !== 0
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
                            <TableItemEmpty v-if="searchResults === 'None'" :title="`No search result for ${searchDirValue}`" />
                            <SearchTableItem v-for="item in searchResults"
                                             v-if="searchResults !== 'None'"
                                             :item="item"
                                             :key="item.fullName"
                                             :class="{
                                    'bg-gray-100': isSelected(item),
                                }"
                                             class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                             @click="handleSelect(item)" />
                        </tbody>
                    </table>
                    <ul
                        v-if="fileBrowserTypeView === ViewType.GRID"
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
                      <GridItemEmpty v-if="searchResults === 'None'"/>
                      <GridItem v-for="item in searchResults"
                                v-if="searchResults !== 'None'"
                                :item="item"
                                :key="item.fullName"
                                :title="item.fullName"
                                class="relative"
                                draggable="true"
                                @click="handleSelect(item)"
                                @dblclick="handleItemClick(item)"
                                @dragover="event => onDragOver(event, item)"
                                @dragstart="event => onDragStart(event, item)"
                                @drop="() => onDrop(item)"
                      />
                      </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { defineComponent, watch } from 'vue';
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
        ViewType,
        fileBrowserTypeView,
    } from '@/store/fileBrowserStore';
    import { useRouter } from 'vue-router';
    import SearchTableItem from '@/components/fileBrowser/Table/SearchTableItem.vue'
    import TableItemEmpty from '@/components/fileBrowser/Table/TableItemEmpty.vue'
    import GridItem from '@/components/fileBrowser/Grid/GridItem.vue'
    import GridItemEmpty from "@/components/fileBrowser/Grid/GridItemEmpty.vue";



    const router = useRouter();

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
