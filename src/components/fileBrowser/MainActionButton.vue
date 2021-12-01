<template>
  <button
      class="text-white py-2 px-4 mr-2 rounded-md bg-primary hover:bg-accent-800 transition duration:300"
      @click="$emit('openDialog')"
  >
    <i class="fas fa-plus"></i> {{title}}
  </button>
</template>

<script setup lang="ts">
interface IProps{
  title: string;
}
const props = defineProps<IProps>()

const emit = defineEmits(['openDialog'])

</script>

<style scoped>

</style>