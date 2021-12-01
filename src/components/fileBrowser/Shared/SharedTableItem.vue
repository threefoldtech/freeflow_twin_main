<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex flex-row items-center text-md">
        <div class="mr-3 w-7 text-center">
          <i
              :key="item.name"
              class="fa-2x"
              :class="
                                                        getIconDirty(
                                                            item.isFolder,
                                                            getFileType(getExtension(item.name))
                                                        ) +
                                                        ' ' +
                                                        getIconColorDirty(
                                                            item.isFolder,
                                                            getFileType(getExtension(item.name))
                                                        )
                                                    "
          ></i>
        </div>
        <div class="flex flex-col items-start py-1">
                                                <span class="text-md hover:underline cursor-pointer">
                                                    {{ item.name }}
                                                </span>
          <span class="text-xs opacity-50 cursor-pointer hover:underline">
                                                    From: {{ item.owner.id }}
                                                </span>
        </div>
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex flex-row items-center text-md">
        {{ formatBytes(item.size, 2) }}
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import {
  formatBytes,
  getExtension,
  getFileType,
  getIconColorDirty, getIconDirty, goTo,
  PathInfoModel,
  selectedPaths, sharedContent
} from "@/store/fileBrowserStore";

const props = defineProps<{item: PathInfoModel}>()

const isSelected = (item: PathInfoModel) => selectedPaths.value.includes(item);


</script>

<style scoped>

</style>