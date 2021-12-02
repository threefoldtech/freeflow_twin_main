<template>
  <li  title="Shared folder">
    <div
        class="bg-white
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
        <i class="fas fa-share-alt-square fa-lg text-blue-400"></i>
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
          {{title}}
        </p>
        <button class="absolute inset-0 focus:outline-none" type="button"></button>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">

interface IProps {
  title: string;
}

const props = defineProps<IProps>()

</script>

<style scoped>

</style>