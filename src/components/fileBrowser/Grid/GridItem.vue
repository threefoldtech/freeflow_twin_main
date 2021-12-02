<template>
  <li
  >
    <div
        :class="{ 'bg-gray-200': isSelected(item), 'bg-white': !isSelected(item) }"
        class="
                                        group
                                        w-full
                                        aspect-w-16 aspect-h-3
                                        rounded
                                        border
                                        border-gray-200
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
            :class="
                                                getIconDirty(item.isFolder, getFileType(getExtension(item.name))) +
                                                ' ' +
                                                getIconColorDirty(item.isFolder, getFileType(getExtension(item.name)))
                                            "
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
</template>

<script setup lang="ts">
import {
  getExtension,
  getFileExtension,
  getFileLastModified, getFileType,
  getIconColorDirty, getIconDirty,
  PathInfoModel,
  selectedPaths
} from "@/store/fileBrowserStore";
import {PathInfo} from "@/services/fileBrowserService";

interface IProps {
  item: PathInfo
}

const props = defineProps<IProps>()

const isSelected = (item: PathInfoModel) => {
  if (!selectedPaths.value.includes(item)) return false;
  else return true;
};

</script>

<style scoped>

</style>