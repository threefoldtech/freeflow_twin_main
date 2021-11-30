<template>
  <tr>
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
</template>

<script setup lang="ts">
import {
  getFileExtension,
  getFileLastModified,
  getFileSize,
  getIcon,
  getIconColor,
  goToFileDirectory, itemAction, PathInfoModel, selectedPaths
} from "@/store/fileBrowserStore";


interface IProps{
  item: PathInfoModel;
}

const props = defineProps<IProps>()

const handleItemClick = (item: PathInfoModel) => {
  itemAction(item);
};

const truncatePath = str => {
  if (str.length > 30) {
    return str.substr(0, 20) + '...' + str.substr(-30);
  }
  return str;
};



</script>

<style scoped>
</style>