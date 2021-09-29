<template>
    <div class="my-2 relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input type="text" @focus="handleInput" @input="handleInput" v-model='searchTerm' class="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md" placeholder="Search" />
        <div v-if='searchTerm!== ""' @click='searchTerm=""'
             class='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'>
            <i class='fa fa-window-close h-5 w-5 text-gray-400'
               aria-hidden='true' />
        </div>
    </div>
    <div class="flex flex-col">
        <div class="-my-2">
            <div class="py-2 align-middle inline-block min-w-full">
                <div style="max-height: 500px" class="shadow border-b overflow-auto border-gray-200 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100">
                            <tr>
                                <th
                                    scope="col"
                                    class="
                                        px-6
                                        py-3
                                        text-left text-xs
                                        font-medium
                                        text-gray-500
                                        uppercase
                                        tracking-wider
                                        sticky
                                        top-0
                                        z-50
                                    "
                                >
                                    Chats
                                </th>
                                <th
                                    scope="col"
                                    class="
                                        px-6
                                        py-3
                                        text-left text-xs
                                        font-medium
                                        text-gray-500
                                        uppercase
                                        tracking-wider
                                        sticky
                                        top-0
                                        z-50
                                    "
                                ></th>
                                <th
                                    scope="col"
                                    class="
                                        px-6
                                        py-3
                                        text-left text-xs
                                        font-medium
                                        text-gray-500
                                        uppercase
                                        tracking-wider
                                        sticky
                                        top-0
                                        z-50
                                    "
                                ></th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr
                                v-for="(item) in searchResults()"
                                :key="item"
                            >
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <AvatarImg :id="item.chatId" alt="chat image" />
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">
                                                {{ item.name }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="cursor-pointer rounded-xl bg-gray-50 border border-gray-200 w-28 justify-between flex content-center items-center ">
                                        <span @click="item.canWrite = false" class="p-2 rounded-xl" :class="{ 'bg-primary text-white': !item.canWrite }"> Read</span>
                                        <span @click="item.canWrite = true" class="p-2 rounded-xl" :class="{ 'bg-primary text-white': item.canWrite }"> Write</span>
                                    </div>
                                </td>
                                <td :key="item.isAlreadySent" class="text-center">
                                    <button
                                        @click="shareFile(item.chatId)"
                                        class="text-white py-2 px-4 rounded-md justify-self-end bg-primary"
                                        v-if="!item.isAlreadySent"
                                    >
                                        Share
                                    </button>
                                    <span class="text-xs" v-else>
                                        File has been shared.
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Chat } from '@/types';
import { selectedPaths, addShare } from '@/store/fileBrowserStore';
import { defineComponent, ref, computed, onMounted, onBeforeMount } from 'vue';
import Toggle from '@/components/Toggle.vue';
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
import { sendMessageObject, usechatsActions, usechatsState } from '@/store/chatStore';
import AvatarImg from '@/components/AvatarImg.vue';
import { SystemMessageTypes, MessageTypes } from '@/types';
const { sendMessage } = usechatsActions();
import { createNotification } from '@/store/notificiationStore';
import { SearchIcon } from '@heroicons/vue/solid';
export default defineComponent({
    components: { SearchIcon, Toggle, AvatarImg },
    props: {
        data: {
            type: Array,
            required: true,
        },
    },
    emits: ['update:modelValue', 'clicked'],

    setup(props, { emit }) {
        const searchTerm = ref('');
        const chats = ref([])
        const alreadySentChatIds = ref(<String[]>[])


        onBeforeMount(()=>{
           chats.value =  props.data.map( (item:Chat) => {
               return {
                   name:item.name,
                   chatId:item.chatId,
                   canWrite:false,
                   isAlreadySent: false
               }
            }
        )
        })


        const reset = () => {
            emit('update:modelValue', '');
            searchTerm.value = '';
        };

        const handleInput = evt => {
            emit('update:modelValue', evt.target.value);
        };

        const searchResults = () => {
            return chats.value.filter((item: Chat) => {
                return item.name.toLowerCase().includes(searchTerm.value.toLowerCase());
            });
        };

        async function shareFile(chatId) {
            const size = selectedPaths.value[0].size;
            const filename = selectedPaths.value[0].fullName;
            console.log(chatId)
            const chat = chats.value.find(chat =>chat.chatId ==chatId)
            console.log(chat)

            await addShare(chatId, selectedPaths.value[0].path, filename, size, chat.canWrite);
            chat.isAlreadySent = true
            console.log(chat)
            createNotification('Shared File', 'File has been shared with ' + chatId);
        }

        return {
            reset,
            handleInput,
            searchTerm,
            searchResults,
            selectedPaths,
            shareFile,
            alreadySentChatIds
        };
    },
});
</script>

<style scoped>
.mh-48 {
    max-height: 10rem;
}
</style>
