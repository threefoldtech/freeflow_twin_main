<template>
    <div
        @click="createPostModalStatus = true"
        class="z-50 bg-white relative"
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
                <TabPanel class="relative">
                    <FileDropArea @send-file="selectFiles">
                        <div class="p-4 flex items-start h-48">
                            <AvatarImg :id="user.id" class="w-12 h-12"></AvatarImg>
                            <textarea
                                class="ml-4 text-base text-gray-800 p-2 outline-none block w-full border-none h-full"
                                placeholder="Write something about you"
                                v-model="new_post_text"
                            />
                        </div>
                        <div class="flex flex-col" v-if="errorFileSize">
                          <small class="px-4 text-gray-500">File size limit is 20MB per image</small>
                          <small class="px-4 text-gray-500">Only png/jpeg files allowed</small>
                        </div>
                        <div class="p-4">
                            <ImageGrid
                                v-if="new_post_images.length >= 1 && createPostModalStatus"
                                :images="new_post_images"
                                @resetImage="new_post_images = []"
                            />
                        </div>
                        <input
                            @change="handleFileInput"
                            type="file"
                            multiple="multiple"
                            ref="create_post_file_upload"
                            accept="image/png, image/gif, image/jpeg"
                            class="hidden border-none outline-none ring-0"
                        />
                        <div :class="{'border-b-lg' : createPostModalStatus}"
                        class="border-t-2 p-4 block">
                            <div
                                @click="$refs.create_post_file_upload.click()"
                                class="bg-gray-300 px-4 py-2 rounded-full flex items-center w-28 cursor-pointer hover:bg-gray-200"
                            >
                                <CameraIcon class="text-gray-600 w-6 h-6" /><span class="ml-2 font-medium text-gray-600"
                                    >Media</span
                                >
                            </div>
                        </div>
                    </FileDropArea>
                    <div @click.stop v-if="createPostModalStatus" class="bg-gray-200 px-4 h-14 flex items-center justify-center border-t-2 rounded-b-lg absolute -bottom-14 w-full">
                        <button
                            class="w-full py-2 bg-primary text-white font-semibold rounded hover:bg-accent-800 duration-100"
                            :class="{ 'opacity-50': !isAllowedToPost }"
                            @click="handleCreatePost"
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
        class="w-full h-full inset-0 fixed z-40 bg-black opacity-10"
    ></div>
</template>

<script setup lang="ts">
    import { PhotographIcon, XIcon, PencilAltIcon, FilmIcon, DotsVerticalIcon } from '@heroicons/vue/solid';
    import { CameraIcon, HeartIcon, ChatAltIcon } from '@heroicons/vue/outline';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState } from '@/store/authStore';
    import { computed, ref } from 'vue';
    import { showComingSoonToUhuru, createPostModalStatus } from '@/services/dashboardService';
    import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';
    import ImageGrid from '@/components/Dashboard/ImageGrid.vue';
    import FileDropArea from '@/components/FileDropArea.vue';
    import {createSocialPost, getAllPosts} from '@/services/socialService';

    const new_post_images = ref<File[]>([]);
    const new_post_text = ref<string>('');
    const errorFileSize = ref<boolean>(false)


    const isAllowedToPost = computed(() => {
        return new_post_images.value.length >= 1 || new_post_text.value !== '' ? true : false;
    });

    const checkFileSize = (image: File) => {
      if((image.size/1024 /1024) >= 20){
        errorFileSize.value = true
      }
    }

    enum SUPPORTED_EXTENSIONS {
      JPEG = "image/jpeg",
      PNG = "image/png",
    }

    const isExtensionSupported = (image: File) => {
        const options = Object.values(SUPPORTED_EXTENSIONS)
        options.includes(image.type) ? '' : errorFileSize.value = true
    }

    const handleFileInput = e => {
        errorFileSize.value = false;
        new_post_images.value = [];
        for (const file of e.target.files) {
            checkFileSize(file)
            isExtensionSupported(file)
            new_post_images.value.push(file);
        }
        errorFileSize.value ? new_post_images.value = [] : ''
    };



    const selectFiles = (files: File[]) => {
      createPostModalStatus.value = true;
      errorFileSize.value = false;
      new_post_images.value = [];
        for (const file of files) {
            checkFileSize(file)
            isExtensionSupported(file)
            new_post_images.value.push(file);
        }
      errorFileSize.value ? new_post_images.value = [] : ''
    };



    const handleCreatePost = async () => {
        errorFileSize.value = false;
        if (!isAllowedToPost.value) return;
        await createSocialPost(new_post_text.value, new_post_images.value);
        await getAllPosts();
        new_post_images.value = [];
        new_post_text.value = '';
        createPostModalStatus.value = false
    };

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
        } /*,
        {
            name: 'Albums',
            component: PhotographIcon,
        },
        {
            name: 'Video',
            component: FilmIcon,
        },*/,
    ]);

    const { user } = useAuthState();
</script>

<style></style>
