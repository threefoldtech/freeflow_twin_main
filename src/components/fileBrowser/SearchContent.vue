<template>
    <div class='h-full overflow-y-auto'>
        <h1 class="p-2">Search results for {{ searchDirValue }}</h1>
        <table class='w-full box-border' :key='currentDirectory'>
            <thead>
            <tr v-if="searchResults !== 'None'">
                <th class='text-left select-none pl-4'>
                    Name
                </th>
                <th class='text-left select-none'>
                    Extension
                </th>
                <th class='text-left select-none'>
                    Size
                </th>
                <th class='text-left select-none'>
                    Last Modified
                </th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="searchResults === 'None'">
                <td colspan='5' class='italic text-gray-500 text-2xl text-center'>No Search results for
                    {{ searchDirValue }}!
                </td>
            </tr>
            <tr
                v-for='item in searchResults'
                class='hover:bg-gray-200 h-10 border-b border-t border-gray-300'
                :key='item.fullName'
                v-if="searchResults !== 'None'"
            >
                <td>
                    <div class='flex flex-row items-center pl-4 py-1'>
                        <div class='mr-3 w-7'>
                            <i class='fa-2x'
                               :class='getIcon(item)+ " " + getIconColor(item)'
                            ></i>
                        </div>
                        <div class='flex flex-col items-start py-1'>
                        <span class="text-md hover:underline cursor-pointer"
                              @click='handleItemClick(item)'>
                            {{ item.name }}
                        </span>
                            <span class="text-xs opacity-50 cursor-pointer hover:underline"
                                  @click='goToFileDirectory(item)'
                            >
                        {{ item.path }}
                        </span>

                        </div>
                    </div>
                </td>
                <td>{{ getFileExtension(item) }}</td>
                <td>{{ getFileSize(item) }}</td>
                <td>{{ getFileLastModified(item) }}</td>

            </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue';
    import {
        currentDirectory,
        searchResults,
        searchDirValue,
        selectedPaths,
        getFileLastModified,
        getFileExtension,
        getFileSize,
        getIconColor,
        getIcon, PathInfoModel, itemAction, goToFileDirectory
    } from '@/store/fileBrowserStore';
    import { useRouter } from 'vue-router';

    export default defineComponent({
        name: 'SearchContent',
        setup() {
            const router = useRouter();
            const handleItemClick = (item: PathInfoModel) => {
                if(item.isDirectory){
                    goToFileDirectory(item)
                    return
                }
                itemAction(item, router);
            };

            return {
                searchResults,
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
            };
        },
    });
</script>

<style scoped>

</style>