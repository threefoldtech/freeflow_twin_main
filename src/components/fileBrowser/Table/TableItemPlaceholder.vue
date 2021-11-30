<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap hidden"></td>
    <td
        class="px-6 py-4 whitespace-nowrap"
        @click="action"
    >
      <div class="flex flex-row items-center text-md">
        <div class="mr-3 w-7 text-center">
          <i class="fas fa-share-alt-square fa-2x text-blue-400"></i>
        </div>
        <span class="hover:underline cursor-pointer">{{title}}</span>
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">-</td>
    <td class="px-6 py-4 whitespace-nowrap">-</td>
    <td class="px-6 py-4 whitespace-nowrap">-</td>
  </tr>
</template>

<script setup lang="ts">
import {defineProps} from "vue";

interface IProps{
  title: string;
  action: Function;
}

const props = defineProps<IProps>()

</script>

<style scoped>
</style>