<template>
  <div x-cloak x-show.transition.origin.bottom="open2" x-on:mouseover="open2 = true" x-on:mouseleave="open2 = false"
       class="absolute -top-40 -left-10 mt-4 bg-white px-4 py-4 w-72 shadow rounded cursor-default z-10">
    <div class="flex space-x-3">
      <div class="flex flex-shrink-0">
        <img :src="comment.profile_image" alt="" class="h-16 w-16 object-fill rounded-full">
      </div>
      <div class="flex flex-col space-y-2">
        <div class="font-semibold text-base">
          <a href="#" class="hover:underline">
            {{ comment.name }}
          </a>
        </div>

        <div class="flex justify-start items-center space-x-2">
          <div class="w-auto text-sm leading-none">
            <small>
              Friends since <span class="font-medium">21 November</span>
            </small>
          </div>
        </div>
        <div class="flex justify-start items-center space-x-2">
          <div class="w-auto text-sm leading-none">
            <small>
              <span class="font-semibold text-green-700 text-sm">Online</span>
            </small>
          </div>
        </div>
      </div>
    </div>
    <div class="flex space-x-1 mt-4">
      <div class="w-1/2">
        <a href="#"
           class="text-xs text-accent-600 hover:bg-opacity-60 font-semibold flex items-center justify-center px-3 py-2 bg-accent-300 bg-opacity-50 rounded-lg">
          <div class="mr-1">
            <img class="w-6 h-6" src="/whisperbold.svg" />
          </div>
          Whisper
        </a>
      </div>
      <div class="w-auto">
        <a href="#"
           class="text-xs text-gray-800 hover:bg-gray-300 font-semibold flex items-center justify-center w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg">
          <img class="w-6 h-6" src="/kutanabold.svg" />
        </a>
      </div>
      <div class="w-auto">
        <a href="#"
           class="text-xs text-gray-800 hover:bg-gray-300 font-semibold flex items-center justify-center w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg">
            <DotsHorizontalIcon class="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {DotsHorizontalIcon} from "@heroicons/vue/solid";

const props = defineProps<{ comment: object }>()
</script>

<style scoped>

</style>