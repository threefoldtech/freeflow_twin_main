<template>
    <div class="flex flex-row items-center">
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
    </div>
    <span
        v-if="modelValue"
        @click.prevent="reset()"
        class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
    >
        x
    </span>
    <div class="flex flex-col mt-4">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in searchResults()" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center justify-between">
                    <div class='flex'>
                    <div class="flex-shrink-0 h-10 w-10">
                      <AvatarImg :id="item.id" alt="contact image" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ item.id }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ item.location }} 205546654
                      </div>
                    </div>
                    </div>
                    <div>
                        <button v-if="userIsInGroup(item)" @click="removeUserFromGroup(item)" style="backgroundColor: #EF4444;" class="text-white rounded-md justify-self-end">Delete invite</button>
                        <button v-if="!userIsInGroup(item)" @click="usersInGroup.push(item)" style="backgroundColor: #16A085;" class="text-white rounded-md justify-self-end">Invite to group</button>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="!searchResults().length">
                <td><p class="text-sm p-3 text-center">No Matching Results</p></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
    import { Contact } from '@/types';
    import { defineComponent, ref, computed, onMounted } from 'vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    export default defineComponent({
        components: { AvatarImg },
        props: {
            modelValue: {
                type: String,
                required: false,
            },
            placeholder: {
                type: String,
                required: false,
                default: 'Enter text here.',
            },
            data: {
                type: Array,
                required: true,
            },
            usersInGroup: {
                type: Array,
                required: true,
            },
            error: {
                type: String,
                default: '',
            },
        },
        emits: ['update:modelValue', 'clicked'],

        setup(props, { emit }) {
            const chosenOption = ref('');
            const searchTerm = ref('');

            const reset = () => {
                emit('update:modelValue', '');
                chosenOption.value = '';
                searchTerm.value = '';
            };

            const handleInput = evt => {
                emit('update:modelValue', evt.target.value);
            };

            const handleClick = item => {
                console.log(chosenOption.value);
                chosenOption.value = item.id;
                searchTerm.value = item.id;
                emit('update:modelValue', item.id);
                emit('clicked');
            };

            const searchResults = () => {
                return props.data.filter((item: Contact) => {
                    return item.id
                        .toLowerCase()
                        .includes(searchTerm.value.toLowerCase());
                });
            };

            const userIsInGroup = (contact: props.data) => {
                const user = props.usersInGroup.find(c => c.id == contact.id);
                if (user) {
                    return true;
                }
                return false;
            };

            const removeUserFromGroup = (contact: props.data) => {
                const index = props.usersInGroup.findIndex(u => u.id == contact.id);
                props.usersInGroup.splice(index, 1);
            };

            return {
                reset,
                handleInput,
                handleClick,
                chosenOption,
                searchTerm,
                searchResults,
                userIsInGroup,
                removeUserFromGroup,
            };
        },
    });
</script>

<style scoped>
    .mh-48 {
        max-height: 10rem;
    }
</style>