<template>
    <div class="bg-white rounded">
        <TabGroup>
            <TabList class="flex items-stretch h-12">
                <Tab v-slot="{ selected }" v-for="tab in navigation" :key="tab.name" as="template">
                    <div
                        class="px-8 font-medium flex flex-row items-center cursor-pointer"
                        :class="{ 'bg-white': selected, 'bg-gray-200': !selected }"
                    >
                        <component :is="tab.component" class="w-4 h-4 text-gray-400 mr-4" />
                        <p>{{ tab.name }}</p>
                    </div>
                </Tab>
                <div class="h-full bg-gray-200 flex-grow self-stretch"></div>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <div class="p-4 flex items-center">
                        <AvatarImg :id="user.id" class="rounded-full w-12 h-12"></AvatarImg>
                        <input
                            class="ml-4 text-base text-gray-800 p-2 outline-none"
                            value=""
                            placeholder="Write something about you"
                        /></div
                ></TabPanel>
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
</template>

<script setup lang="ts">
    import { PhotographIcon, PencilAltIcon, FilmIcon, DotsVerticalIcon } from '@heroicons/vue/solid';
    import { HeartIcon, ChatAltIcon } from '@heroicons/vue/outline';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState } from '@/store/authStore';
    import { ref } from 'vue';
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
