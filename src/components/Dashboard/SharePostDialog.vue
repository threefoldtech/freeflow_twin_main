<template>
<div @click="$emit('close')" class="inset-0 bg-black h-full w-full bg-opacity-50 fixed z-50 flex justify-center items-center">
  <div @click.stop class="bg-white w-full p-4 rounded-lg">
    <h1>Share post</h1>
    <div class="p-2 rounded">
      <div class="flex items-center">
        <div class="w-8 h-8 bg-gray-500"></div>
        <p class="ml-3">Conor Mcgregor</p>
      </div>

    </div>
    <div class="flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>

                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="chat in chats" :key="chat.adminId">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img class="h-10 w-10 rounded-full" alt="" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        Name
                      </div>
                      <div class="text-sm text-gray-500">
                        Email
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">Title</div>
                  <div class="text-sm text-gray-500">Departm</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
  import {onBeforeMount} from "vue";
  import {usechatsActions, usechatsState} from "@/store/chatStore";
  import {SOCIAL_POST} from "@/store/socialStore";

  const emit = defineEmits(['close'])

  const { retrievechats } = usechatsActions();
  const { chats } = usechatsState();

  const props = defineProps<{item: SOCIAL_POST}>();

  onBeforeMount(async () => {
    await retrievechats()
    console.log(chats.value)
  })


</script>

<style scoped>

</style>