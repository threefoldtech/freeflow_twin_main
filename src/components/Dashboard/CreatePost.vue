<template>
    <div
        @click="createPostModalStatus = true"
        class="z-50 bg-white rounded-lg relative"
        :class="{ 'drop-shadow-lg': createPostModalStatus }"
    >
        <TabGroup>
            <TabList class="flex items-stretch h-12 rounded-t-lg relative">
                <Tab v-slot="{ selected }" v-for="tab in navigation" :key="tab.name" as="template">
                    <div
                        class="px-8 font-medium flex flex-row items-center cursor-pointer"
                        :class="{ 'bg-white': selected, 'bg-gray-200': !selected }"
                    >
                        <component :is="tab.component" class="w-4 h-4 text-gray-400 mr-4" />
                        <p>{{ tab.name }}</p>
                    </div>
                </Tab>
                <div class="h-full bg-gray-200 flex-grow self-stretch flex items-center justify-end pr-4">
                    <XIcon
                        @click.stop
                        v-if="createPostModalStatus"
                        @click="createPostModalStatus = false"
                        class="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800 transition duration-100"
                    />
                </div>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <div class="p-4 flex items-start h-48">
                        <AvatarImg :id="user.id" class="rounded-full w-12 h-12"></AvatarImg>
                        <textarea
                            class="ml-4 text-base text-gray-800 p-2 outline-none block w-full border-none h-full"
                            placeholder="Write something about you"
                        />
                    </div>
                    <div class="border-t-2 p-4 block">
                        <div
                            class="
                                bg-gray-300
                                px-4
                                py-2
                                rounded-full
                                flex
                                items-center
                                w-28
                                cursor-pointer
                                hover:bg-gray-200
                            "
                        >
                            <CameraIcon class="text-gray-600 w-6 h-6" /><span class="ml-2 font-medium text-gray-600"
                                >Media</span
                            >
                        </div>
                    </div>
                    <div @click.stop v-if="createPostModalStatus" class="bg-gray-200 px-4 py-4 border-t-2 rounded-b-lg">
                        <button
                            class="
                                w-full
                                py-2
                                bg-primary
                                text-white
                                font-semibold
                                rounded
                                hover:bg-accent-800
                                duration-100
                            "
                        >
                            Publish
                        </button>
                    </div>
                </TabPanel>
                <TabPanel>
                    <div class="p-4 flex items-center justify-center h-32">
                        <p class="font-medium">Coming soon</p>
                    </div>
                </TabPanel>
                <TabPanel>
                    <div class="p-4 flex items-center justify-center h-32">
                        <p class="font-medium">Coming soon</p>
                    </div>
                </TabPanel>
            </TabPanels>
        </TabGroup>
    </div>
    <div
        @click="createPostModalStatus = false"
        v-if="createPostModalStatus"
        class="w-full h-full inset-0 fixed z-40 bg-black bg-opacity-25"
    ></div>
</template>

<script setup lang="ts">
    import { PhotographIcon, XIcon, PencilAltIcon, FilmIcon, DotsVerticalIcon } from '@heroicons/vue/solid';
    import { CameraIcon, HeartIcon, ChatAltIcon } from '@heroicons/vue/outline';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState } from '@/store/authStore';
    import { ref } from 'vue';
    import { createPostModalStatus } from '@/services/dashboardService';
    import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';

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

    const navigation = ref([
        {
            name: 'Publish',
            component: PencilAltIcon,
        },
        {
            name: 'Albums',
            component: PhotographIcon,
        },
        {
            name: 'Video',
            component: FilmIcon,
        },
    ]);

    const { user } = useAuthState();
</script>

<style></style>
