<template>
    <!-- :href="calcExternalResourceLink(message.body.url)" -->
    <a
        :download="message.body.filename"
        class="px-4 my-2 my-message:bg-accent-200 cursor-pointer"
        @click="openSharedFile(message)"
    >
        <div
            class="
                icon
                bg-gray-600
                rounded-full
                h-12
                w-12
                flex
                items-center
                justify-center
                text-white
                my-message:bg-icon
            "
        >
            <i class="fas fa-file"></i>
        </div>
        <div class="pt-2 my-message:text-icon text-base">
            {{ message.body.filename }}
        </div>
    </a>
</template>

<script lang="ts" setup>
import { downloadAttachment } from '@/services/fileBrowserService';
import { calcExternalResourceLink } from '@/services/urlService';
import { FileShareMessageType, Message, MessageBodyType } from '@/types';
import router from "@/plugins/Router";
import {currentDirectoryContent, itemAction, savedAttachments, updateAttachments} from "@/store/fileBrowserStore";
import {useAuthState} from "@/store/authStore";

interface IProp {
    message: Object;
}

const props = defineProps<IProp>();

const downloadAttachmentToQuantum = async (message: Message<MessageBodyType>) => {
  await downloadAttachment(message);
};

const openSharedFile = async (message: Message<MessageBodyType>, count = 0) => {
  const {user} = useAuthState()
  if(message.from !== user.id){
    //@TODO make this more efficient
    const result = (await updateAttachments(`/${message.from}`))?.data
    const file = result.find(item => item.fullName === message.body.filename)
    if (count >= 3) return;
    if(!file){
      await downloadAttachmentToQuantum(message)
      openSharedFile(message)
      return;
    }
    savedAttachments.value = true
    //@ts-ignore
    itemAction(file, undefined)
  }
};
</script>
