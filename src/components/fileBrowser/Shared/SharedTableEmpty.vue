<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap">{{title}}</td>
    <td class="px-6 py-4 whitespace-nowrap"></td>
  </tr>
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{title: string}>(), {title: 'Nothing has been shared with you yet!'})

</script>

<style scoped>

</style>