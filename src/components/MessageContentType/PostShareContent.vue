<template>
<div class="bg-white rounded-lg px-4 py-2">
  <pre class="hidden">
    {{JSON.stringify(message, null ,2)}}
  </pre>
 <p class="text-lg font-semibold mb-2">Shared a post</p>
  <div class="flex items-center space-x-2">
    <img :src="avatarImg" class="w-8 h-8 bg-red-500 rounded-full" />
    <p>{{message.body.owner.id}}</p>
  </div>
  <p class="mt-2 text-xs text-gray-400">{{truncatedText}}</p>
  <p @click="goToSocialPost" class="font-semibold mt-2 cursor-pointer">Read post</p>
</div>

</template>

<script setup lang="ts" >

import {Message} from "@/types";
import {MESSAGE_POST_SHARE_BODY} from "@/store/socialStore";
import {computed} from "vue";
import {calcExternalResourceLink} from "@/services/urlService";

const props = defineProps<{message: Message<MESSAGE_POST_SHARE_BODY>}>()

const truncatedText = computed(() => {
  const text = props.message.body.post?.body;
  return `${props.message.body.post?.body.substring(0,255)}${text?.length > 255 ? '...': ''}`
})

const avatarImg = computed(() => {
  return calcExternalResourceLink(`http://[${props.message.body.owner.location}]/api/user/avatar/default`)
})

const goToSocialPost = () => {

}


</script>

<style scoped>

</style>