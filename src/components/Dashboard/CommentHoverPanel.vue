<template>
  <div
      class="absolute -top-40 -left-10 mt-4 bg-white px-4 py-4 w-72 shadow rounded cursor-default z-50">
    <div class="flex space-x-3">
      <div class="flex flex-shrink-0">
        {{ comment.avatar }}
        <img :src="avatar" alt="" class="h-16 w-16 object-fill rounded-full">
      </div>
      <div class="flex flex-col space-y-2">
        <div class="font-semibold text-base">
          <a class="hover:underline" href="#">
            {{ comment.owner.id }}
          </a>
        </div>

        <div class="flex justify-start items-center space-x-2">
          <div class="w-auto text-sm leading-none hidden">
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
      <div class="">
        <a class="text-xs text-accent-600 hover:bg-opacity-60 font-semibold flex items-center justify-center px-3 py-2 bg-accent-300 bg-opacity-50 rounded-lg"
           href="#"
           @click="goToChat">
          <div class="mr-1 h-6 flex items-center flex-shrink-0">
            <img class="" src="/whisperbold.svg"/>
          </div>
          {{ isPersonFriend }}
        </a>
      </div>
      <div class="w-auto">
        <a class="text-xs text-gray-800 hover:bg-gray-300 font-semibold flex items-center justify-center w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg"
           href="#">
          <img class="w-6 h-6" src="/kutanabold.svg"/>
        </a>
      </div>
      <div class="w-auto">
        <a class="text-xs text-gray-800 hover:bg-gray-300 font-semibold flex items-center justify-center w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg"
           href="#">
          <DotsHorizontalIcon class="w-4 h-4"/>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {DotsHorizontalIcon} from "@heroicons/vue/solid";
import {useRouter} from "vue-router";
import {useContactsActions, useContactsState} from "@/store/contactStore";
import {usechatsActions} from "@/store/chatStore";
import {computed, nextTick, onBeforeMount, ref} from "vue";
import {myYggdrasilAddress} from "@/store/authStore";

const {contacts} = useContactsState()
const {addContact} = useContactsActions()
const {retrievechats} = usechatsActions()

const props = defineProps<{ comment: object, avatar: string }>()
const location = ref<string>()
const router = useRouter()

onBeforeMount(async () => {
  await retrievechats()
  location.value = await myYggdrasilAddress();
})

const isPersonFriend = computed(() => {
  if (location.value === props.comment.owner.location) return "Can't talk to yourself"
  return contacts.some(item => item.id === props.comment.owner.id) ? 'Whisper' : "Add friend"
})


const goToChat = async () => {
  if (location.value === props.comment.owner.location) return false
  if (!contacts.some(item => item.id === props.comment.owner.id)) {
    await retrievechats()
    await addContact(props.comment.owner.id, props.comment.owner.location)
    return false
  }
  await nextTick(async () => {
    localStorage.setItem('lastOpenedChat', props.comment.owner.id)
    router.push({name: 'whisper'})
  });
}


</script>

<style scoped>

</style>