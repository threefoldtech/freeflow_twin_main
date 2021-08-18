<template>
    <!--<div class="flex flex-row items-center">
        <label class="mr-2" for="username">Username:</label>
        <input
            v-model="searchTerm"
            @focus="handleInput"
            @input="handleInput"
            :placeholder="placeholder"
            v-focus
            tabindex="0"
            maxlength="50"
        />
        <span
          v-if="modelValue"
          @click.prevent="reset()"
          class="cursor-pointer"
        >
          <i class="fas fa-times"></i>
        </span>
    </div>-->
    <div class="flex flex-col">
        <div class="-my-2 sm:-mx-6 lg:-mx-8">
            <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
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
                            <tr v-for="(item, index) in searchResults()" :key="index">
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
                                    <Toggle :v-model="writeRights"></Toggle>
                                </td>
                                <td>
                                    <button
                                        @click="shareFile(item.chatId)"
                                        style="backgroundcolor: #16a085"
                                        class="text-white py-2 px-4 rounded-md justify-self-end"
                                    >
                                        Share
                                    </button>
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
    import { selectedPaths, getToken } from '@/store/fileBrowserStore';
    import { defineComponent, ref, computed, onMounted } from 'vue';
    import Toggle from '@/components/Toggle.vue';
    import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
    import { sendMessageObject, usechatsActions, usechatsState } from '@/store/chatStore';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { SystemMessageTypes, MessageTypes } from '@/types';
    const { sendMessage } = usechatsActions();
    import { createNotification } from '@/store/notificiationStore';
    export default defineComponent({
        components: { Toggle, AvatarImg },
        props: {
            data: {
                type: Array,
                required: true,
            },
        },
        emits: ['update:modelValue', 'clicked'],

        setup(props, { emit }) {
            const searchTerm = ref('');
            let writeRights = ref(false);

            const reset = () => {
                emit('update:modelValue', '');
                searchTerm.value = '';
            };

            const handleInput = evt => {
                emit('update:modelValue', evt.target.value);
            };

            const searchResults = () => {
                return props.data.filter((item: Chat) => {
                    return item.chatId.toLowerCase().includes(searchTerm.value.toLowerCase());
                });
            };

            async function shareFile(chatId) {
                const size = selectedPaths.value[0].size;
                const filename = selectedPaths.value[0].fullName;
                const response = await getToken(chatId, selectedPaths.value[0].path, filename, size, writeRights.value);
                sendMessage(
                    chatId,
                    { token: response.data.token, fileName: filename, size: size },
                    MessageTypes.FILE_SHARE
                );
                //showShareDialog.value = false
                createNotification('Shared File', 'File has been shared with ' + chatId);
            }

            return {
                reset,
                handleInput,
                searchTerm,
                searchResults,
                selectedPaths,
                writeRights,
                shareFile,
            };
        },
    });
</script>

<style scoped>
    .mh-48 {
        max-height: 10rem;
    }
</style>
