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
        <div class="shadow border-b border-gray-200 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chats
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in searchResults()" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">
                  
                    <div class='flex'>
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
                    <Listbox as="div" v-model="writeRights">
                        <div class="mt-1 relative">
                            <ListboxButton class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <span class="flex items-center">
                                    <span class="ml-3 block truncate">{{ writeRights.name }}</span>
                                </span>
                                <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </ListboxButton>

                            <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                                <ListboxOptions class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                    <ListboxOption as="template" v-for="option in options" :key="option.name" :value="option" v-slot="{ active, selected }">
                                        <li :class="[active ? 'text-white bg-indigo-600' : 'text-gray-900', 'cursor-default select-none relative py-2 pl-3 pr-9']">
                                            <div class="flex items-center">
                                                <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate']">
                                                    {{option.name}}
                                                </span>
                                            </div>

                                            <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                                                <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                            </span>
                                        </li>
                                    </ListboxOption>
                                </ListboxOptions>
                            </transition>
                        </div>
                    </Listbox>
                </td>
                <td>
                    <button @click="shareFile(item.chatId)" style="backgroundColor: #16A085;" class="text-white py-2 px-4 rounded-md justify-self-end">Share</button>
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
    import {
    selectedPaths,
    getToken,
} from '@/store/fileBrowserStore';
    import { defineComponent, ref, computed, onMounted } from 'vue';
    import {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    } from '@headlessui/vue'
    import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
    import {sendMessageObject, usechatsActions, usechatsState} from '@/store/chatStore';
    import AvatarImg from '@/components/AvatarImg.vue';
    import {SystemMessageTypes, MessageTypes} from '@/types';
    const {sendMessage} = usechatsActions();
    import {createNotification} from '@/store/notificiationStore';
    export default defineComponent({
        components: { Listbox, ListboxButton, ListboxOptions, ListboxOption, AvatarImg },
        props: {
            data: {
                type: Array,
                required: true,
            },
        },
        emits: ['update:modelValue', 'clicked'],

        setup(props, { emit }) {
            const searchTerm = ref('');
            const options = [
                { name: 'Read' },
                { name: 'Write' },
            ];
            let writeRights = ref(options[0]);

            const reset = () => {
                emit('update:modelValue', '');
                searchTerm.value = '';
            };

            const handleInput = evt => {
                emit('update:modelValue', evt.target.value);
            };


            const searchResults = () => {
                return props.data.filter((item: Chat) => {
                    return item.chatId
                        .toLowerCase()
                        .includes(searchTerm.value.toLowerCase());
                });
            };

            async function shareFile(chatId) {
                const size= selectedPaths.value[0].size
                const filename = selectedPaths.value[0].fullName
                const response = await getToken(chatId, selectedPaths.value[0].path, filename, size, writeRights.value)
                sendMessage(chatId, {token: response.data.token, fileName: filename, size: size}, MessageTypes.FILE_SHARE)
                //showShareDialog.value = false
                createNotification("Shared File", "File has been shared with "+ chatId)
            }

            return {
                reset,
                handleInput,
                searchTerm,
                searchResults,
                selectedPaths,
                options,
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