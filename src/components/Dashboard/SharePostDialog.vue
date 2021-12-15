<template>
<div @click="$emit('close')" class="inset-0 bg-black h-full w-full bg-opacity-50 fixed z-50 flex justify-center items-center">
  <div @click.stop class="bg-white w-11/12 sm:w-9/12 lg:w-2/4 2xl:w-1/3 p-4 rounded-lg relative">
    <XIcon @click="$emit('close')" class="w-5 h-5 text-gray-500 absolute right-4 top-4 cursor-pointer" />
    <h1 class="font-medium">Share post</h1>
    <div class="p-4 rounded  bg-gray-100 my-4">
      <div class="flex items-center">
          <img class="w-10 h-10 rounded-full" :src="avatarImg" />
        <p class="ml-3 font-medium">{{item.owner.id}}</p>
      </div>
      <div class="mt-2 text-gray-600">
        <p>{{item.post.body}}</p>
      </div>
    </div>
    <div class="flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div class="overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
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
                    <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full">
                      <img :src="getAvatar(parseContactLocation(chat.adminId))" class="h-10 w-10 rounded-full" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{chat.chatId}}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div v-if="!isAlreadySharedWWithPerson(chat.adminId)" class="flex items-center justify-end">
                    <Spinner v-if="isInQueue(chat.adminId)" small />
                    <p v-if="isInQueue(chat.adminId)"  class="cursor-pointer text-red-500 ml-4" @click="cancelShare(chat.adminId)">Cancel</p>
                  </div>
                  <a href="#" v-if="!isInQueue(chat.adminId) && !isAlreadySharedWWithPerson(chat.adminId)" @click="sharePostWithFriend(chat.adminId)" class="text-indigo-600 hover:text-accent-900">Share</a>
                  <p v-if="isAlreadySharedWWithPerson(chat.adminId)">Post shared</p>
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
import {computed, onBeforeMount, ref} from "vue";
  import {usechatsActions, usechatsState} from "@/store/chatStore";
  import {SOCIAL_POST} from "@/store/socialStore";
  import {calcExternalResourceLink} from "@/services/urlService";
  import Spinner from '@/components/Spinner.vue'
  import {XIcon} from "@heroicons/vue/solid";

  const emit = defineEmits(['close'])

  const { retrievechats } = usechatsActions();
  const { chats } = usechatsState();

  const queue = ref<string[]>([])
  const peopleIHaveSharedWith = ref<string[]>([])

  const props = defineProps<{item: SOCIAL_POST, avatar: any}>();

  const sharePostWithFriend = (id: string) => {
    queue.value.push(id)
    setTimeout(() => {
        if(!isInQueue(id)) return
        queue.value = queue.value.filter(item => item !== id)
        //Do request

        peopleIHaveSharedWith.value.push(id)
    }, 2000)
  }

  const parseContactLocation = (id: string) => {
    const chat = chats.value.find(item => item.chatId === id)
    return chat.contacts.find(contact => contact.id === id)?.location
  }

  const isAlreadySharedWWithPerson = (id: string) => {
    return peopleIHaveSharedWith.value.some(item => item === id)
  }

  const cancelShare = (id: string) => {
    queue.value = queue.value.filter(item => item !== id)
  }

  const isInQueue = (id) => {
    return queue.value.some(item => item === id)
  }

  const getAvatar = (location: string) => {
    return calcExternalResourceLink(`http://[${location}]/api/user/avatar/default`)
  }

  const avatarImg = computed(() => {
    return calcExternalResourceLink(`http://[${props.item.owner.location}]/api/user/avatar/default`)
  })

  onBeforeMount(async () => {
    await retrievechats()
    console.log(chats.value)
  })


</script>

<style scoped>

</style>