<template>
    <div class="bg-white rounded">
        <div class="flex items-stretch">
            <div>
                <div class="px-8 py-4 font-medium flex flex-row items-center cursor-pointer">
                    <PencilAltIcon class="w-4 h-4 text-gray-400 mr-4" />
                    <p>Publish</p>
                </div>
            </div>
            <div>
                <div class="px-8 py-4 font-medium bg-gray-200 flex flex-row items-center cursor-pointer">
                    <PhotographIcon class="w-4 h-4 text-gray-400 mr-4" />
                    <p class="text-gray-400">Albums</p>
                </div>
            </div>
            <div>
                <div class="px-8 py-4 font-medium bg-gray-200 flex flex-row items-center cursor-pointer">
                    <FilmIcon class="w-4 h-4 text-gray-400 mr-4" />
                    <p class="text-gray-400">Video</p>
                </div>
            </div>
            <div class="h-full bg-gray-400 flex-grow self-stretch"></div>
        </div>
        <div class="p-4 flex items-center">
            <AvatarImg :id="user.id" class="rounded-full w-12 h-12"></AvatarImg>
            <input
                class="ml-4 text-base text-gray-800 p-2 outline-none"
                value=""
                placeholder="Write something about you"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { PhotographIcon, PencilAltIcon, FilmIcon, DotsVerticalIcon } from '@heroicons/vue/solid';
    import { HeartIcon, ChatAltIcon } from '@heroicons/vue/outline';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState } from '@/store/authStore';
    import { ref } from 'vue';

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

    const { user } = useAuthState();
</script>

<style></style>
