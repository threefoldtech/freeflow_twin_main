<template>
    <div
        v-if="showImagePreview"
        class="inset-0 bg-black bg-opacity-50 w-full h-full flex justify-center items-center z-50 fixed p-8"
        @click="showImagePreview = false"
    >
        <XIcon
            class="absolute right-4 top-4 w-12 h-12 cursor-pointer text-white z-50"
            @click="showImagePreview = false"
        />
        <img :src="imagePreviewSrc" class="pointer-events-none z-50 max-h-full" @click.stop />
    </div>
    <SharePostDialog
        v-if="showShareDialog"
        :avatarImg="avatarImg"
        :item="item"
        @close="showShareDialog = false"
        class="z-50"
    />

    <Alert v-if="showDeletePostDialog" :showAlert="showDeletePostDialog" @close="showDeletePostDialog = false">
        <template #title> Deleting post </template>
        <template #content>Do you really want to delete your post?</template>
        <template #actions>
            <button
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                @click="doDeletePost"
            >
                Delete
            </button>
            <button
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                @click="showDeletePostDialog = false"
            >
                Cancel
            </button>
        </template>
    </Alert>

    <div class="bg-white my-5 rounded">
        <div class="p-6">
            <div>
                <div class="relative">
                    <TransitionRoot
                        :show="openPanel"
                        class="absolute z-50 -top-44 -left-20"
                        enter="transition-opacity duration-150"
                        enter-from="opacity-0"
                        enter-to="opacity-100"
                        leave="transition-opacity duration-250"
                        leave-from="opacity-100"
                        leave-to="opacity-0"
                    >
                        <keep-alive>
                            <CommentHoverPanel
                                v-if="openPanel"
                                :avatar="avatarImg"
                                :comment="item"
                                @mouseleave="
                                    mouseFocussed = false;
                                    openPanel = false;
                                "
                                @mouseover="
                                    mouseFocussed = true;
                                    panelTimer();
                                "
                            />
                        </keep-alive>
                    </TransitionRoot>
                    <div class="flex items-center">
                        <div
                            class="relative mr-4 cursor-pointer"
                            @mouseover="
                                mouseFocussed = true;
                                panelTimer();
                            "
                            @mouseleave="
                                mouseFocussed = false;
                                panelTimer();
                            "
                        >
                            <AvatarImg
                                :id="item.owner.id"
                                :showOnlineStatus="false"
                                class="w-12 h-12 rounded-full"
                                alt="avatar"
                            />
                        </div>
                        <div>
                            <p
                                class="text-base font-medium cursor-pointer hover:underline"
                                @click="showComingSoonToUhuru = true"
                                @mouseover="
                                    mouseFocussed = true;
                                    panelTimer();
                                "
                                @mouseleave="
                                    mouseFocussed = false;
                                    panelTimer();
                                "
                            >
                                {{ item.owner.id }}
                            </p>
                            <p class="text-xs text-gray-400">{{ timeAgo(item.post.createdOn) }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-4 text-gray-600">
                <p class="my-2 break-words">{{ item.post.body }}</p>
                <div :class="{ 'grid-cols-1': item.images.length === 1 }" class="grid grid-cols-2 my-4 gap-1">
                    <div
                        v-for="(image, idx) in item.images.slice(0, showAllImages ? item.images.length : 4)"
                        :key="idx"
                        class="relative overflow-hidden cursor-pointer max-h-96 rounded"
                    >
                        <div
                            v-if="!showAllImages && idx === 3 && item.images.length >= 5"
                            class="absolute inset-0 bg-black w-full h-full bg-opacity-50 flex justify-center items-center"
                        >
                            <p class="text-white text-2xl">+{{ item.images.length - 4 }}</p>
                        </div>
                        <img
                            :src="fetchPostImage(image)"
                            class="object-cover rounded"
                            @click="openImagePreview(image)"
                        />
                    </div>
                </div>
                <p
                    v-if="item.images.length > 4"
                    class="w-full text-center my-3 cursor-pointer font-medium"
                    @click="() => (showAllImages = !showAllImages)"
                >
                    {{ showAllImages ? 'Hide images' : 'Show all images' }}
                </p>
            </div>
            <div>
                <div class="flex items-center w-full">
                    <div class="hidden flex -space-x-2 overflow-hidden">
                        <img
                            alt=""
                            class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                            src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        />
                        <img
                            alt=""
                            class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                            src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        />
                        <img
                            alt=""
                            class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                        />
                    </div>
                    <!-- <div> -->
                    <!--     <p class="font-medium text-primary flex text-xs"> -->
                    <!--         <span> -->
                    <!--             {{ props.item.likes[0].id -->
                    <!--             }}<span class="mr-1" v-if="props.item.likes.length > 2">,</span -->
                    <!--             ><span v-else>&nbsp;likes this</span> -->
                    <!--         </span> -->
                    <!--     </p> -->
                    <!--     <p class="text-gray-600 text-xs" v-if="props.item.likes.length > 2"> -->
                    <!--         and {{ props.item.likes.length }} others liked this -->
                    <!--     </p> -->
                    <!-- </div> -->
                    <div class="flex items-center">
                        <HeartIconSolid class="hidden text-red-500 w-5 h-5 mr-2" />
                        <p class="text-gray-600 font-medium flex-shrink-0 text-sm">
                            {{ amount_likes }} {{ amount_likes === 1 ? 'Like' : 'Likes' }}
                        </p>
                    </div>
                    <p class="text-gray-600 mr-0 ml-auto cursor-pointer text-md" @click="showComments = !showComments">
                        {{ countComments() }} Comments
                    </p>
                </div>
            </div>
        </div>
        <div class="border-t-2 flex space-x-8 p-4">
            <div class="flex items-center cursor-pointer text-gray-500 hover:text-red-500" @click="like">
                <TransitionRoot
                    :show="!localLike"
                    enter="transition-opacity duration-150"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="transition-opacity duration-250"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <HeartIcon v-if="!localLike" class="w-6 mr-4" />
                </TransitionRoot>
                <TransitionRoot
                    :show="localLike"
                    enter="transition-opacity duration-150"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="transition-opacity duration-250"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <HeartIconSolid v-if="localLike" class="w-6 text-red-500 mr-4" />
                </TransitionRoot>
                <p class="w-11">
                    {{ localLike ? 'Liked' : 'Like' }}
                </p>
            </div>
            <div
                class="flex items-center cursor-pointer text-gray-500 hover:text-primary"
                @click="showComments = !showComments"
            >
                <ChatAltIcon class="w-6 mr-4" />
                <p>Comment</p>
            </div>
            <div
                class="flex items-center cursor-pointer text-gray-500 hover:text-green-500"
                @click="showShareDialog = true"
            >
                <ShareIcon class="w-6 mr-4" />
                <p>Share</p>
            </div>
            <div
                v-if="props.item.owner.id === user.id.toString()"
                class="flex items-center cursor-pointer text-gray-500 hover:text-red-900"
                @click="showDeletePostDialog = true"
            >
                <TrashIcon class="w-6 mr-4" />
                <p>Delete</p>
            </div>
        </div>
        <div>
            <TransitionRoot
                :show="showComments"
                enter="transition-opacity duration-150"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="transition-opacity duration-250"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <form
                    v-if="showComments"
                    :class="{ 'opacity-50': postingCommentInProgress }"
                    class="px-2 py-2 flex items-center space-x-1"
                    @submit.prevent="handleAddComment(false)"
                >
                    <div>
                        <AvatarImg :id="String(user.id)" :showOnlineStatus="false" :small="true" alt="avatar" />
                    </div>
                    <input
                        :ref="inputRef"
                        v-model="messageInput"
                        :disabled="postingCommentInProgress"
                        class="text-xs font-medium rounded-full bg-gray-200 border-none outline-none focus:ring-0 ring-0 px-4 h-10 flex-grow"
                        placeholder="Type your message here"
                        type="text"
                        @focus="focusInput"
                    />
                    <input
                        class="cursor-pointer text-xs font-medium rounded-full bg-accent-800 hover:bg-accent-600 text-white border-none outline-none flex-grow-0 w-24 h-10"
                        type="submit"
                        value="Send"
                    />
                </form>

                <CommentsContainer
                    v-if="showComments && item.replies.length > 0"
                    :comments="item.replies"
                    :postingCommentInProgress="postingCommentInProgress"
                    class="border-t-2 rounded-b-lg"
                    :class="{ 'max-h-[35rem]': $route.name === 'single' }"
                    @replyToComment="e => handleAddComment(true, e.comment_id, e.input)"
                />
            </TransitionRoot>
            <TransitionRoot
                :show="showIsUserTyping"
                as="div"
                class="flex items-center px-4"
                enter="transition-opacity duration-150"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="transition-opacity duration-250"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="ds-preloader-block">
                    <div class="ds-preloader-block__loading-bubble"></div>
                    <div class="ds-preloader-block__loading-bubble"></div>
                    <div class="ds-preloader-block__loading-bubble"></div>
                </div>
                <p class="px-4 py-2 text-sm font-medium text-gray-500">Someone is typing</p>
            </TransitionRoot>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { HeartIcon as HeartIconSolid, XIcon } from '@heroicons/vue/solid';
    import { HeartIcon, ChatAltIcon, ShareIcon, TrashIcon } from '@heroicons/vue/outline';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState, myYggdrasilAddress } from '@/store/authStore';
    import { ref, computed, onBeforeMount, watch } from 'vue';
    import moment from 'moment';
    import { TransitionRoot } from '@headlessui/vue';
    import { showComingSoonToUhuru } from '@/services/dashboardService';
    import CommentsContainer from '@/components/Dashboard/CommentsContainer.vue';
    import { LIKE_STATUS } from '@/store/socialStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { deletePost, getSinglePost, likePost, setSomeoneIsTyping } from '@/services/socialService';
    import SharePostDialog from '@/components/Dashboard/SharePostDialog.vue';
    import CommentHoverPanel from '@/components/Dashboard/CommentHoverPanel.vue';
    import Alert from '@/components/Alert.vue';
    import { IPostContainerDTO } from 'custom-types/post.type';

    const props = defineProps<{ item: IPostContainerDTO }>();
    const inputRef = ref<HTMLInputElement>(null);
    const messageInput = ref<string>('');
    const showComments = ref<boolean>(false);
    const showAllImages = ref<boolean>(false);
    const amount_likes = ref<number>(props.item.likes.length);
    const myLocation = ref<string | null>(null);
    const showImagePreview = ref<boolean>(false);
    const imagePreviewSrc = ref<string | null>(null);
    const showShareDialog = ref<boolean>(false);
    const showDeletePostDialog = ref(false);
    const openPanel = ref<boolean>(false);
    const mouseFocussed = ref(false);
    const postingCommentInProgress = ref<boolean>(false);
    const { user } = useAuthState();
    const emit = defineEmits(['refreshPost']);

    //only shows user panel if mouse stays focussed for a moment
    const panelTimer = () => setTimeout(() => (openPanel.value = mouseFocussed.value), 600);

    watch([showComments, amount_likes], () => {
        getSinglePost(props.item.post.id, props.item.owner.location);
    });

    const doDeletePost = () => {
        deletePost(props.item);
        showDeletePostDialog.value = false;
    };

    const countComments = (total = 0, comments = props.item.replies) => {
        for (let comment of comments) {
            total++;
            total = countComments(total, comment.replies);
        }
        return total;
    };

    const showIsUserTyping = computed(() => {
        return props.item?.isTyping && props.item?.isTyping?.length !== 0 && showComments.value ? true : false;
    });

    watch(messageInput, async (n, o) => {
        if (n.length > o.length) {
            await setSomeoneIsTyping(props.item.post.id, props.item.owner.location, user.id.toString());
        }
    });

    const localLike = ref(false);

    onBeforeMount(async () => {
        myLocation.value = await myYggdrasilAddress();
        const { user } = useAuthState();
        if (props.item.likes.some(item => item.id === user.id)) {
            localLike.value = true;
        }
    });

    const openImagePreview = image => {
        imagePreviewSrc.value = fetchPostImage(image);
        showImagePreview.value = true;
    };

    const avatarImg = computed(() => {
        return calcExternalResourceLink(`http://[${props.item.owner.location}]/api/v1/user/avatar/default`);
    });

    const fetchPostImage = (image: string) => {
        return calcExternalResourceLink(`http://[${props.item.owner.location}]/api/v2/files/${image}`);
    };

    const timeAgo = time => {
        return moment(time).fromNow();
    };

    const handleAddComment = async (isReplyToComment: boolean = false, _comment_id?: string, message?: string) => {
        if (postingCommentInProgress.value) return;
        const comment_value = isReplyToComment ? message : messageInput.value;
        if (!comment_value || comment_value === '' || !/\S/.test(comment_value)) return;
        postingCommentInProgress.value = true;
        messageInput.value = '';
        const response = await getSinglePost(props.item.post.id, props.item.owner.location);
        postingCommentInProgress.value = false;
        emit('refreshPost', response);
    };

    const like = async () => {
        const { status } = await likePost(props.item.post.id, props.item.owner.location);
        if (status === LIKE_STATUS.LIKED) {
            localLike.value = true;
            amount_likes.value = amount_likes.value + 1;

            return;
        }
        amount_likes.value = amount_likes.value - 1;
        localLike.value = false;

        return;
    };

    const actions = ref([
        {
            name: 'Like',
            component: HeartIcon,
            active: HeartIconSolid,
            active_text: 'Liked',
            execute: async () => {
                const { status } = await likePost(props.item.post.id, props.item.owner.location);
                if (status === LIKE_STATUS.LIKED) {
                    localLike.value = true;
                    amount_likes.value = amount_likes.value + 1;

                    return;
                }
                amount_likes.value = amount_likes.value - 1;
                localLike.value = false;

                return;
            },
        },
        {
            name: 'Comment',
            component: ChatAltIcon,
            active: ChatAltIcon,
            execute: async () => {
                showComments.value = !showComments.value;
            },
        },
    ]);
</script>

<style scoped>
    @keyframes bubble-load {
        0% {
            transform: scale(0);
            opacity: 0;
        }

        25% {
            transform: scale(1);
            opacity: 1;
        }

        100% {
            transform: scale(0);
            opacity: 0;
        }
    }

    body {
        text-align: center;
    }

    /*
    .some-holder-styles{
      display: none;
      position: absolute;
      z-index: 9;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
    }
    */

    .ds-preloader-block__loading-bubble {
        display: inline-block;
        width: 10px;
        height: 10px;
        margin: 0 2px;
        transform: scale(0);
        opacity: 0;
        background: #2e266f;
        animation: bubble-load 1.5s infinite backwards;
        border-radius: 50%;
    }

    .ds-preloader-block__loading-bubble:nth-child(2) {
        animation-delay: 0.18s;
    }

    .ds-preloader-block__loading-bubble:nth-child(3) {
        animation-delay: 0.36s;
    }
</style>
