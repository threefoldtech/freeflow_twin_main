<template>
    <div
        @click="createPostModalStatus = true"
        class="z-40 bg-white relative"
        :class="{ 'drop-shadow-lg': createPostModalStatus }"
    >
        <TabGroup>
            <TabList class="hidden lg:flex items-stretch h-12 rounded-t-lg relative">
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
                <TabPanel @wheel.prevent @touchmove.prevent @scroll.prevent class="relative">
                    <TransitionRoot
                        :show="isPublishingNewPost"
                        enter="transition-opacity duration-75"
                        enter-from="opacity-0"
                        enter-to="opacity-100"
                        leave="transition-opacity duration-150"
                        leave-from="opacity-100"
                        leave-to="opacity-0"
                    >
                        <div class="absolute h-full w-full flex items-center justify-center z-50">
                            <Spinner />
                            <p class="ml-4 font-semibold text-accent-800">Creating post</p>
                        </div>
                        <div
                            class="absolute h-full w-full flex items-center justify-center z-40 bg-white bg-opacity-50"
                        ></div>
                    </TransitionRoot>
                    <FileDropArea @send-file="selectFiles">
                        <div
                            class="p-4 flex items-start"
                            :class="{ 'h-min': !createPostModalStatus, 'h-48': createPostModalStatus }"
                        >
                            <AvatarImg :id="user.id" class="w-12 h-12"></AvatarImg>
                            <div class="flex flex-col w-full h-full py-2 px-4">
                                <textarea
                                    class="resize-none ml-4 text-base text-gray-800 outline-none block w-full border-none focus:outline-none"
                                    :class="{ 'h-full': createPostModalStatus, 'h-min': !createPostModalStatus }"
                                    placeholder="Write something about you"
                                    v-model="newPostText"
                                    maxlength="2000"
                                />
                                <p
                                    v-if="createPostModalStatus"
                                    :class="newPostText.length >= 2000 ? ['text-red-600'] : ''"
                                    class="text-sm text-gray-500 self-end"
                                >
                                    {{ newPostText.length }}/2000
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-col" v-if="error">
                            <small class="px-4 text-sm text-red-500">{{ errorMessage }}</small>
                        </div>
                        <div v-if="newPostImages.length >= 1 && createPostModalStatus" class="p-4">
                            <ImageGrid
                                v-if="newPostImages.length >= 1 && createPostModalStatus"
                                :images="newPostImages"
                                @resetImage="newPostImages = []"
                            />
                        </div>
                        <div v-if="newPostVideoUrl !== '' && createPostModalStatus" class="relative">
                            <div
                                @click="
                                    () => {
                                        newPostVideoUrl = '';
                                        newPostVideo = null;
                                    }
                                "
                                class="z-40 absolute right-6 top-6 cursor-pointer bg-gray-800 hover:bg-gray-500 rounded-full w-8 h-8 flex items-center justify-center"
                            >
                                <XIcon class="w-6 text-gray-400" />
                            </div>
                            <video class="p-4 max-h-[250px]" controls>
                                <source :src="newPostVideoUrl" />
                            </video>
                        </div>
                        <input
                            @change="handleFileInput"
                            type="file"
                            multiple="multiple"
                            ref="create_post_file_upload"
                            accept="image/png, image/jpeg, video/*"
                            class="hidden border-none outline-none ring-0"
                        />
                        <div :class="{ 'border-b-lg': createPostModalStatus }" class="border-t-2 p-4 block">
                            <div
                                @click="$refs.create_post_file_upload.click()"
                                class="px-4 py-2 rounded-full flex items-center w-40 cursor-pointer"
                            >
                                <PhotographIcon class="text-blue-600 w-6 h-6" />
                                <span class="ml-2 font-medium text-blue-600">Photo/Video</span>
                            </div>
                        </div>
                    </FileDropArea>
                    <div
                        @click.stop
                        v-if="createPostModalStatus"
                        class="bg-gray-200 px-4 h-14 flex items-center justify-center border-t-2 rounded-b-lg absolute -bottom-14 w-full"
                    >
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
    <TransitionRoot
        :show="createPostModalStatus"
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
    >
        <div @click="createPostModalStatus = false" class="w-full h-full inset-0 fixed z-30 bg-black opacity-10"></div>
    </TransitionRoot>
</template>

<script setup lang="ts">
    import { XIcon, PencilAltIcon } from '@heroicons/vue/solid';
    import { PhotographIcon } from '@heroicons/vue/outline';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState } from '@/store/authStore';
    import { computed, ref } from 'vue';
    import { createPostModalStatus } from '@/services/dashboardService';
    import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';
    import ImageGrid from '@/components/Dashboard/ImageGrid.vue';
    import FileDropArea from '@/components/FileDropArea.vue';
    import { createSocialPost, getAllPosts } from '@/services/socialService';
    import { TransitionRoot } from '@headlessui/vue';
    import Spinner from '@/components/Spinner.vue';
    import { hasSpecialCharacters } from '@/services/fileBrowserService';
    import { ImageFileExtension, VideoFileExtension } from 'custom-types/file-actions.type';

    const { user } = useAuthState();

    const newPostImages = ref<File[]>([]);
    const newPostVideoUrl = ref('');
    const newPostText = ref('');
    const isPublishingNewPost = ref(false);

    const isAllowedToPost = computed(() => {
        return (
            newPostImages.value.length >= 1 ||
            newPostText.value.trim() !== '' ||
            newPostVideoUrl.value.trim() !== '' ||
            !isPublishingNewPost ||
            !isPublishingNewPost.value
        );
    });

    const checkFileSize = (image: File) => {
        if (image.size / 1024 / 1024 >= 20) showError('File size limit is 20MB per image');
    };

    const isExtensionSupported = (image: File) => {
        const extensions = { ...ImageFileExtension, ...VideoFileExtension };
        const options = Object.values(extensions);
        const fileExtension = image.name.split('.').pop();
        if (!options.includes(<ImageFileExtension | VideoFileExtension>fileExtension)) {
            showError('Only png/jpeg and video formats are allowed');
        }
    };

    const newPostVideo = ref<File>();
    const error = ref(false);
    const errorMessage = ref('');

    const handleFileInput = e => {
        error.value = false;

        for (const file of e.target.files) {
            checkFile(file);
            if (newPostImages.value.length > 10) {
                error.value = true;
                errorMessage.value = 'A post can only have a maximum of 10 images';
                break;
            }
            const vidOptions = Object.values(VideoFileExtension);
            const fileExtension = file.name.split('.').pop() as VideoFileExtension;
            if (vidOptions.includes(fileExtension)) {
                newPostVideo.value = file;
                newPostVideoUrl.value = URL.createObjectURL(file);
                return;
            }

            newPostImages.value.push(file);
        }

        error.value ? (newPostImages.value = []) : '';
    };

    const checkFile = (file: File) => {
        checkFileSize(file);
        isExtensionSupported(file);
        checkOnSpecialCharacters(file.name);
    };

    const checkOnSpecialCharacters = (name: string) => {
        if (hasSpecialCharacters(name)) showError('No special characters allowed');
    };

    const showError = (msg: string) => {
        error.value = true;
        errorMessage.value = msg;
    };

    const selectFiles = (files: File[]) => {
        createPostModalStatus.value = true;
        error.value = false;
        newPostImages.value = [];
        newPostVideo.value = null;
        newPostVideoUrl.value = '';
        for (const file of files) {
            checkFile(file);

            const vidOptions = Object.values(VideoFileExtension);
            const fileExtension = file.name.split('.').pop();
            if (vidOptions.includes(fileExtension as VideoFileExtension)) {
                newPostVideo.value = file;
                newPostVideoUrl.value = URL.createObjectURL(file);
                return;
            }

            newPostImages.value.push(file);
        }
        error.value ? (newPostImages.value = []) : '';
    };

    const handleCreatePost = async () => {
        if (!isAllowedToPost.value || isPublishingNewPost.value) return;
        error.value = false;

        isPublishingNewPost.value = true;
        if (!isAllowedToPost.value) {
            isPublishingNewPost.value = false;
            return;
        }
        const files = [];
        newPostImages.value.forEach(file => files.push(file));
        newPostVideo.value ? files.push(newPostVideo.value) : '';
        await createSocialPost(newPostText.value, files);
        await getAllPosts();
        isPublishingNewPost.value = false;
        newPostImages.value = [];
        newPostText.value = '';
        newPostVideo.value = null;
        newPostVideoUrl.value = '';
        createPostModalStatus.value = false;
    };

    const navigation = ref([
        {
            name: 'Publish',
            component: PencilAltIcon,
        },
    ]);
</script>

<style></style>
