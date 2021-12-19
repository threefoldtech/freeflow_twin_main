<template>
  <TransitionRoot
      :show="showPost"
      enter="transition-opacity duration-75"
      enter-from="opacity-0"
      enter-to="opacity-100"
      leave="transition-opacity duration-150"
      leave-from="opacity-100"
      leave-to="opacity-0"
  >
  <div @click="showPost = false" class="z-50 inset-0 w-full h-full bg-opacity-25 bg-black fixed flex items-center justify-center drop-shadow-md">
    <div @click.stop class="m-4 w-full sm:w-9/12 md:w-7/12 lg:w-2/4 xl:w-1/2 2xl:w-2/5 z-50 max-h-[80%] rounded-lg overflow-y-auto">
      <Post @click.stop :item="postData" />
    </div>
  </div>
  </TransitionRoot>
<div @click="goToSocialPost" class="bg-white rounded-lg px-4 py-2 cursor-pointer">
 <p class="text-lg font-semibold mb-2">Shared a post</p>
  <div class="flex items-center space-x-2">
    <img :src="avatarImg" class="w-8 h-8 bg-red-500 rounded-full" />
    <p>{{message.body.owner.id}}</p>
  </div>
  <p class="mt-2 text-xs text-gray-400">{{truncatedText}}</p>
</div>
</template>

<script setup lang="ts" >
import {Message} from "@/types";
import {MESSAGE_POST_SHARE_BODY, SOCIAL_POST} from "@/store/socialStore";
import {computed, ref} from "vue";
import {calcExternalResourceLink} from "@/services/urlService";
import {getSinglePost} from "@/services/socialService";
import { TransitionRoot } from '@headlessui/vue'

import Post from '@/components/Dashboard/Post.vue'

const props = defineProps<{message: Message<MESSAGE_POST_SHARE_BODY>}>()
const showPost = ref<boolean>(false)
const postData = ref<SOCIAL_POST | null>(null)

const truncatedText = computed(() => {
  const text = props.message.body.post?.body;
  return `${props.message.body.post?.body.substring(0,255)}${text?.length > 255 ? '...': ''}`
})

const avatarImg = computed(() => {
  return calcExternalResourceLink(`http://[${props.message.body.owner.location}]/api/user/avatar/default`)
})

const goToSocialPost = async () => {
  const post = await getSinglePost(props.message.body.post.id,props.message.body.owner.location)
  if(!post) return;
  console.log(postData)
  postData.value = post;
  showPost.value = true;
}


</script>

<style scoped>

</style>