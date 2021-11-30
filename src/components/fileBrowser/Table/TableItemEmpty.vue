<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap">{{title}}</td>
    <td class="px-6 py-4 whitespace-nowrap">-</td>
    <td class="px-6 py-4 whitespace-nowrap">-</td>
    <td class="px-6 py-4 whitespace-nowrap">-</td>
  </tr>
</template>
<script setup lang="ts">
interface IProps{
  title: string;
}
const props = withDefaults(defineProps<IProps>(), {
  title: 'Empty directory'
})

</script>
<style></style>