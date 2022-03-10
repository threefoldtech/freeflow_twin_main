<template>
  <div :class="{'ml-10': comment.type === MESSAGE_TYPE.COMMENT_REPLY}" class="flex items-center space-x-2 relative"
       @mouseleave="openPanel = false">
    <div class="flex flex-shrink-0 self-start cursor-pointer" @mouseover="openPanel = true">
      <div class="w-10">
        <img :src="avatarImg" alt="" class=" object-cover rounded-full">
      </div>
    </div>
    <TransitionRoot :show="openPanel"
                    as='template'
                    enter="transition-opacity duration-150"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="transition-opacity duration-250"
                    leave-from="opacity-100"
                    leave-to="opacity-0">
      <CommentHoverPanel v-if="openPanel" :avatar="avatarImg" :comment="comment" @mouseleave="openPanel = false"/>
    </TransitionRoot>
    <div class="flex items-center justify-center space-x-2 relative">
      <div class="block">
        <div class="bg-gray-100 w-auto rounded-xl px-2 pb-2 ">
          <div class="font-medium">
            <a class="hover:underline text-sm" href="#" @mouseover="openPanel = true">
              <small>{{ comment.owner.id }}</small>
            </a>
          </div>
          <div class="text-xs">
            {{ comment.body }}
          </div>
        </div>
        <div class="flex justify-start items-center text-xs w-full">
          <div class="font-semibold text-gray-700 px-2 flex items-center justify-center space-x-1">
            <a @click="handleLikeComment"  class="hover:underline">
              <small>Like</small>
            </a>
            <small v-if="comment.type === MESSAGE_TYPE.COMMENT" class="self-center">.</small>
            <a v-if="comment.type === MESSAGE_TYPE.COMMENT" class="hover:underline" href="#" @click="reply">
              <small>Reply</small>
            </a>
            <small class="self-center">.</small>
            <a class="hover:underline" href="#">
              <small>{{ moment(comment.createdOn).fromNow() }}</small>
            </a>
          </div>
        </div>
      </div>
      <div v-if="comment.likes.length >= 1" class="absolute -bottom-1 -right-5 flex items-center">
        <div class="w-14 h-7 bg-white shadow flex items-center justify-center rounded-full cursor-pointer">
          <ThumbUpIcon class="text-primary w-4 h-4"/>
          <span class="text-xs ml-2 font-medium">{{ comment.likes.length }}</span>
        </div>

      </div>
    </div>
    <div
        class="self-stretch flex justify-center items-center transform transition-opacity duration-200 opacity-0 translate -translate-y-2 hover:opacity-100">
      <a class="" href="#">
        <div
            class="text-xs cursor-pointer flex h-6 w-6 transform transition-colors duration-200 hover:bg-gray-100 rounded-full items-center justify-center">
          <svg class="w-4 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="2"></path>
          </svg>
        </div>
      </a>
    </div>
  </div>
  <ReplyComment v-for="(reply, idx) in commentsSorted" v-if="commentsSorted.length > 0 && MESSAGE_TYPE.COMMENT"
                :key="reply.id" :comment="reply"/>
  <form v-if="showReplyInput" class="relative flex items-center pl-20 flex-start w-full"
        @submit.prevent="handleReplyForm">
    <div class="w-8 h-8 rounded-full absolute left-20">
      <img :src="myAvatar" class="h-8 rounded-full pointer-events-none">
    </div>
    <input v-model="replyInput" class="text-xs font-medium rounded-full bg-gray-200 border-none outline-none focus:ring-0 ring-0 pl-10 w-2/3"
           placeholder="Type your message here"
           type="text"/>
  </form>
</template>

<script lang="ts" setup>
import {computed, onBeforeMount, ref, watch} from 'vue';
import CommentHoverPanel from '@/components/Dashboard/CommentHoverPanel.vue'
import ReplyComment from '@/components/Dashboard/PostComment.vue';
import moment from "moment";
import {ThumbUpIcon} from "@heroicons/vue/solid";
import {MESSAGE_TYPE} from "@/store/socialStore";
import {calcExternalResourceLink} from "@/services/urlService";
import {myYggdrasilAddress} from "@/store/authStore";
import {TransitionRoot} from "@headlessui/vue";
import {likeComment} from "@/services/socialService";

const openPanel = ref<boolean>(false);
const showComments = ref<boolean>(false);
const props = defineProps<{ comment: any }>()
const showReplyInput = ref<boolean>(false);
const replyInput = ref<string>("")
const myLocation = ref<string>("")

const emit = defineEmits(['replyToComment'])

onBeforeMount(async () => {
  myLocation.value = await myYggdrasilAddress();
})

const commentsSorted = computed(() => {
  return props.comment?.replies.sort(function (a, b) {
    return new Date(a.createdOn) - new Date(b.createdOn);
  });
})


const handleLikeComment = async () => {
  //await likeComment()
/*  const {post, owner, id, isReplyToComment, replyTo} = props.comment

console.log( props.comment)
  console.log(post.id, owner.location, id,isReplyToComment, replyTo)
  await likeComment(post.id, owner.location, id,isReplyToComment, replyTo)*/
}

const avatarImg = computed(() => {
  return calcExternalResourceLink(`http://[${props.comment.owner.location}]/api/user/avatar/default`)
})

const myAvatar = computed(() => {
  return calcExternalResourceLink(`http://[${myLocation.value}]/api/user/avatar/default`)
})


const handleReplyForm = () => {
  if (replyInput.value === "") return;
  emit('replyToComment', {
    input: replyInput.value,
    comment_id: props.comment.id
  })
  replyInput.value = "";
  showReplyInput.value = false;
}

const reply = () => {
  if (props.comment.type === MESSAGE_TYPE.COMMENT) {
    showReplyInput.value = !showReplyInput.value;
  }
}
</script>

<style scoped>

</style>