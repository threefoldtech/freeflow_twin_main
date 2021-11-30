<template>
  <p
      class="px-6
                                    py-4
                                    whitespace-nowrap
                                    col-span-12
                                    text-base
                                    font-medium
                                    text-center text-gray-800
                                    flex
                                    justify-center
                                    flex-col
                                "
  >
    No items in this folder
    <span class="mt-4 underline cursor-pointer" @click="goBack">Go back</span>
  </p>
</template>
<script setup lang="ts">
import {useRouter} from "vue-router";
const router = useRouter()

interface IProps{
  title: string;
}
const props = withDefaults(defineProps<IProps>(), {
  title: 'No items in this folder'
})

const goBack = () => {
  router.go(-1);
};

</script>

<style scoped>

</style>