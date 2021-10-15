<template>
    <div class="bg-white my-5 rounded">
        <div class="p-6">
            <div>
                <div class="relative">
                    <div class="flex items-center">
                        <div class="relative mr-4">
                            <AvatarImg :id="user.id" class="rounded-full w-12 h-12"></AvatarImg>
                        </div>
                        <div>
                            <p class="text-base font-medium">{{ props.item.author }}</p>
                            <p class="text-xs text-gray-400">{{ timeAgo(props.item.date_modified) }}</p>
                        </div>
                    </div>
                    <div class="group absolute right-0 top-0">
                        <Popover v-slot="{ open }" class="relative">
                            <PopoverButton
                                :class="open ? '' : 'text-opacity-90'"
                                class="
                                    items-center
                                    text-base
                                    font-medium
                                    text-white
                                    bg-orange-700
                                    rounded-md
                                    group
                                    hover:text-opacity-100
                                    focus:outline-none
                                    focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
                                "
                            >
                                <DotsVerticalIcon
                                    class="text-gray-400 w-5 h-5 cursor-pointer group-hover:text-gray-600"
                                />
                                <ChevronDownIcon
                                    :class="open ? '' : 'text-opacity-70'"
                                    class="
                                        w-5
                                        h-5
                                        ml-2
                                        text-orange-300
                                        transition
                                        duration-150
                                        ease-in-out
                                        group-hover:text-opacity-80
                                    "
                                    aria-hidden="true"
                                />
                            </PopoverButton>

                            <transition
                                enter-active-class="transition duration-200 ease-out"
                                enter-from-class="translate-y-1 opacity-0"
                                enter-to-class="translate-y-0 opacity-100"
                                leave-active-class="transition duration-150 ease-in"
                                leave-from-class="translate-y-0 opacity-100"
                                leave-to-class="translate-y-1 opacity-0"
                            >
                                <PopoverPanel
                                    class="
                                        absolute
                                        z-10
                                        w-screen
                                        max-w-sm
                                        px-4
                                        transform
                                        -translate-x-1/2
                                        left-1/2
                                        sm:px-0
                                        lg:max-w-3xl
                                    "
                                >
                                    <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div class="relative grid gap-8 bg-white p-6">
                                            <a
                                                v-for="item in solutions"
                                                :key="item.name"
                                                :href="item.href"
                                                class="
                                                    items-center
                                                    p-2
                                                    -m-3
                                                    transition
                                                    duration-150
                                                    ease-in-out
                                                    rounded-lg
                                                    hover:bg-gray-50
                                                    focus:outline-none
                                                    focus-visible:ring
                                                    focus-visible:ring-orange-500
                                                    focus-visible:ring-opacity-50
                                                "
                                            >
                                                <div class="">
                                                    <p class="text-sm font-medium text-gray-900">
                                                        {{ item.name }}
                                                    </p>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </PopoverPanel>
                            </transition>
                        </Popover>
                    </div>
                </div>
            </div>
            <div class="mt-4 text-gray-600">
                <p v-html="props.item.content_html"></p>
                <div class="my-6">
                    <img src="/placeholder.png" class="w-full h-auto" />
                </div>
            </div>
            <div>
                <div class="flex items-center w-full">
                    <div class="flex -space-x-2 overflow-hidden">
                        <img
                            class="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                            src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                        />
                        <img
                            class="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                            src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                        />
                        <img
                            class="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                            alt=""
                        />
                    </div>
                    <div class="ml-4">
                        <p class="font-medium text-primary flex">
                            <span v-for="(name, idx) in props.item.persons" :key="name">
                                {{ name }}<span class="mr-1" v-if="idx === 0">,</span>
                            </span>
                        </p>
                        <p class="text-gray-600">and {{ Math.abs(props.item.comments - 2) }} other liked this</p>
                    </div>

                    <p class="text-gray-600 mr-0 ml-auto cursor-pointer">
                        {{ Math.abs(props.item.comments) }} Comments
                    </p>
                </div>
            </div>
        </div>
        <div class="border-t-2 flex space-x-8 p-4">
            <div class="flex items-center cursor-pointer" v-for="action in actions" :key="action.name">
                <component :is="action.component" class="w-6 text-gray-500 mr-3" />
                <p class="text-gray-500">{{ action.name }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { PhotographIcon, PencilAltIcon, FilmIcon, DotsVerticalIcon } from '@heroicons/vue/solid';
    import { HeartIcon, ChatAltIcon } from '@heroicons/vue/outline';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState } from '@/store/authStore';
    import { ref } from 'vue';
    import moment from 'moment';
    import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
    import { ChevronDownIcon } from '@heroicons/vue/solid';

    interface IProps {
        item: {
            id: string;
            content_html: string;
            url: string;
            title: string;
            date_modified: date;
            likes: number;
            comments: number;
            persons: string[];
            author: string;
        };
    }

    const timeAgo = time => {
        return moment(time).fromNow();
    };

    const props = defineProps<IProps>();

    const actions = ref([
        {
            name: 'Like',
            component: HeartIcon,
        },
        {
            name: 'Comment',
            component: ChatAltIcon,
        },
    ]);

    const solutions = [
        {
            name: 'Send private message',
            description: 'Measure actions your users take',
            href: '##',
            icon: `
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden='true'
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="48" height="48" rx="8" fill="#FFEDD5" />
              <path
                d="M24 11L35.2583 17.5V30.5L24 37L12.7417 30.5V17.5L24 11Z"
                stroke="#FB923C"
                stroke-width="2"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.7417 19.8094V28.1906L24 32.3812L31.2584 28.1906V19.8094L24 15.6188L16.7417 19.8094Z"
                stroke="#FDBA74"
                stroke-width="2"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M20.7417 22.1196V25.882L24 27.7632L27.2584 25.882V22.1196L24 20.2384L20.7417 22.1196Z"
                stroke="#FDBA74"
                stroke-width="2"
              />
            </svg>
          `,
        },
        {
            name: 'Share with a friend',
            description: 'Create your own targeted content',
            href: '##',
            icon: `
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="48" height="48" rx="8" fill="#FFEDD5" />
              <path
                d="M28.0413 20L23.9998 13L19.9585 20M32.0828 27.0001L36.1242 34H28.0415M19.9585 34H11.8755L15.9171 27"
                stroke="#FB923C"
                stroke-width="2"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M18.804 30H29.1963L24.0001 21L18.804 30Z"
                stroke="#FDBA74"
                stroke-width="2"
              />
            </svg>`,
        },
    ];

    const { user } = useAuthState();
</script>

<style scoped></style>
