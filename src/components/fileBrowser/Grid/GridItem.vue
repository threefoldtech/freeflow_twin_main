<template>
  <li
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
</template>

<script setup lang="ts">
import {
  getFileExtension,
  getFileLastModified,
  getIcon,
  getIconColor,
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