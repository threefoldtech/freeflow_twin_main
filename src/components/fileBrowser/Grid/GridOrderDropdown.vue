<template>
  <div class="w-48 z-50">
    <Listbox v-model="selectedOrder">
      <div class="relative mt-1">
        <ListboxButton
            class="relative w-full py-2 px-3 text-left focus:outline-none sm:text-sm cursor-pointer text-right"
        >
          <span class="block truncate font-semibold">{{ selectedOrder.name }}</span>
        </ListboxButton>
        <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
          <ListboxOptions
              class="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm text-right"
          >
            <ListboxOption
                @click="() => order.action()"
                v-slot="{ active, selected }"
                v-for="order in viewingOrders"
                :key="order.name"
                :value="order"
                as="template"
            >
              <li
                  :class="[
                  active ? 'text-amber-900 bg-amber-100' : 'text-gray-900',
                  'select-none relative py-2 pl-6 pr-4',
                ]"
                  class="cursor-pointer hover:bg-gray-100"
              >
                <span
                    v-if="selected"
                    class="absolute inset-y-0 right-4 flex items-center pl-3 text-amber-600"
                >
                  <CheckIcon class="w-5 h-5" aria-hidden="true" />
                </span>
                <span
                    :class="[
                    selected ? 'font-medium' : 'font-normal',
                    'block truncate',
                  ]"
                    class="mr-8"
                >{{ order.name }}</span
                >
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeMount, ref, watch} from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid'
import {currentSort, currentSortDir, sortAction, ViewOrder, IViewOrder} from "@/store/fileBrowserStore";


interface IProps{
  viewingOrders: IViewOrder[];
  selectedOrder : IViewOrder;
}

const props = defineProps<IProps>()


   /* const viewingOrders = [
      { name: 'Name', action: () => sortAction('name'), value: 'name' },
      { name: 'Extension', action: () => sortAction('extension'), value: 'extension' },
      { name: 'Size', action: () => sortAction('size'), value: 'size' },
      { name: 'Last updated', action: () => sortAction('lastModified'), value: 'lastModified' },
    ]*/

  /*  const selectedPerson = ref(viewingOrders[0])
      watch([currentSort, currentSortDir],() => {
        selectListItem()
      })

      onBeforeMount(() => {
        selectListItem()
      })

      const selectListItem = () => {
        selectedPerson.value = viewingOrders.filter(order => order.value === currentSort.value)[0]
      }*/
</script>
