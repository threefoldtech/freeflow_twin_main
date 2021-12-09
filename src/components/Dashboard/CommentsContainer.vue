<template>
  <div class="bg-white w-full h-auto px-3 py-2 flex flex-col space-y-2">
    <PostComment @replyToComment="e => $emit('replyToComment', e)" :key="comment.id" v-for="(comment, idx) in commentsSorted" :comment="comment"/>
  </div>
</template>

<script setup lang="ts">
import PostComment from '@/components/Dashboard/PostComment.vue'
import {computed, onBeforeMount, ref} from "vue";

const props = defineProps<{ comments: any }>()
const emit = defineEmits(['replyToComment'])

const commentsSorted = computed(() => {
  return props.comments.sort(function (a, b) {
    return new Date(b.createdOn) - new Date(a.createdOn);
  });
})

</script>

<style scoped>

</style>