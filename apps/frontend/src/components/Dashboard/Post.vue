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
        @image_clicked="openImagePreview"
        class="z-40"
    />

    <Alert v-if="showDeletePostDialog" :showAlert="showDeletePostDialog" @close="showDeletePostDialog = false">
        <template #title> Deleting post</template>
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
                        class="absolute z-50 -top-44 -left-0"
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
                    <div class="flex items-center justify-between">
                        <div class="flex">
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
                                    :contact="item.owner"
                                    :showOnlineStatus="false"
                                    class="w-12 h-12 rounded-full"
                                    alt="avatar"
                                />
                            </div>
                            <div>
                                <p
                                    class="text-base font-medium cursor-pointer hover:underline"
                                    @click="showComingSoonToFreeFlow = true"
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
                        <div class="group" v-if="smallScreen || props.item.owner.id === user.id">
                            <Popover v-slot="{ open }" class="relative z-30">
                                <PopoverButton
                                    :class="open ? '' : 'text-opacity-90'"
                                    class="items-center text-base font-medium text-white rounded-md group hover:text-opacity-100 focus:outline-none"
                                >
                                    <DotsVerticalIcon
                                        class="text-gray-400 w-5 h-5 cursor-pointer group-hover:text-gray-600"
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
                                    <PopoverPanel v-slot="{ close }" class="absolute z-50 top-0 right-5">
                                        <div class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                            <div class="relative grid gap-8 bg-white px-6 py-4 rounded-lg">
                                                <div
                                                    v-if="props.item.owner.id === user.id"
                                                    class="flex items-center cursor-pointer text-gray-500 hover:text-red-900"
                                                    @click="
                                                        showDeletePostDialog = true;
                                                        close();
                                                    "
                                                >
                                                    <TrashIcon class="w-6 mr-4" />
                                                    <p class="w-12">Delete</p>
                                                </div>
                                                <div
                                                    class="sm:hidden flex items-center cursor-pointer text-gray-500 hover:text-green-500"
                                                    @click="
                                                        showShareDialog = true;
                                                        close();
                                                    "
                                                >
                                                    <ShareIcon class="w-6 mr-4" />
                                                    <p>Share</p>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverPanel>
                                </transition>
                            </Popover>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-4 text-gray-600">
                <div class="my-2 break-words whitespace-pre-wrap">
                    <p v-if="!readMore && amount_lines > 5">
                        <span>
                            {{
                                item.post.body
                                    .split(/\r\n|\r|\n/)
                                    .slice(0, 5)
                                    .join('\n')
                            }}
                        </span>
                    </p>
                    <p v-else>{{ item.post.body }}</p>
                    <a
                        class="text-gray-800 cursor-pointer"
                        v-if="amount_lines > 5"
                        @click.prevent="readMore = !readMore"
                    >
                        {{ readMore ? 'Show less' : 'Read more' }}
                    </a>
                </div>
                <div :class="{ 'grid-cols-1': item.images.length === 1 }" class="grid grid-cols-2 my-4 gap-1">
                    <div
                        v-for="(image, idx) in item.images.slice(0, showAllImages ? item.images.length : 4)"
                        :key="idx"
                        class="relative overflow-hidden cursor-pointer max-h-96 rounded"
                        @click="openImagePreview(image)"
                    >
                        <div
                            v-if="!showAllImages && idx === 3 && item.images.length >= 5"
                            @click="showAllImages = !showAllImages"
                            class="absolute inset-0 bg-black w-full h-full bg-opacity-50 flex justify-center items-center"
                        >
                            <p class="text-white text-2xl">+{{ item.images.length - 4 }}</p>
                        </div>
                        <img :src="fetchPostAttachment(image)" class="object-cover rounded" />
                    </div>
                </div>
                <p
                    v-if="item.images.length > 4"
                    class="w-full text-center my-3 cursor-pointer font-medium"
                    @click="() => (showAllImages = !showAllImages)"
                >
                    {{ showAllImages ? 'Hide images' : 'Show all images' }}
                </p>
                <video v-if="item.video !== ''" controls class="mb-4">
                    <source :src="fetchPostAttachment(item.video)" />
                </video>
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
                class="hidden sm:flex items-center cursor-pointer text-gray-500 hover:text-green-500"
                @click="showShareDialog = true"
            >
                <ShareIcon class="w-6 mr-4" />
                <p>Share</p>
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
                <CommentsContainer
                    v-if="showComments && item.replies.length > 0"
                    :comments="item.replies"
                    :postingCommentInProgress="postingCommentInProgress"
                    class="border-t-2 rounded-b-lg"
                    :class="{ 'max-h-[35rem]': $route.name === 'single' }"
                    @replyToComment="e => handleAddComment(true, e.comment_id, e.input)"
                    @updateComments="e => $emit('refreshPost', e)"
                />
                <form
                    v-if="showComments"
                    :class="{ 'opacity-50': postingCommentInProgress }"
                    class="px-2 py-2 flex items-center space-x-1"
                    @submit.prevent="handleAddComment(false)"
                >
                    <div>
                        <AvatarImg :id="user.id" :showOnlineStatus="false" :small="true" alt="avatar" />
                    </div>
                    <input
                        ref="inputRef"
                        v-model="messageInput"
                        :disabled="postingCommentInProgress"
                        class="text-xs font-medium rounded-lg border border-gray-300 outline-none focus:ring-0 ring-0 px-4 h-10 flex-grow"
                        placeholder="Type your message here"
                        type="text"
                        @input="onInput"
                        autofocus
                    />
                    <button type="submit" class="bg-transparent">
                        <span class="material-symbols-rounded text-primary text-4xl"> send </span>
                    </button>
                </form>
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
    import { HeartIcon, ChatAltIcon, ShareIcon, TrashIcon, DotsVerticalIcon } from '@heroicons/vue/outline';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState } from '@/store/authStore';
    import { ref, computed, onBeforeMount, watch, nextTick } from 'vue';
    import moment from 'moment';
    import { TransitionRoot } from '@headlessui/vue';
    import { showComingSoonToFreeFlow } from '@/services/dashboardService';
    import CommentsContainer from '@/components/Dashboard/CommentsContainer.vue';
    import { LIKE_STATUS } from '@/store/socialStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { commentOnPost, deletePost, getSinglePost, likePost, setSomeoneIsTyping } from '@/services/socialService';
    import SharePostDialog from '@/components/Dashboard/SharePostDialog.vue';
    import CommentHoverPanel from '@/components/Dashboard/CommentHoverPanel.vue';
    import Alert from '@/components/Alert.vue';
    import { IPostContainerDTO } from 'custom-types/post.type';
    import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
    import { useScrollActions } from '@/store/scrollStore';
    import { useDebounceFn } from '@vueuse/core';

    const { user } = useAuthState();
    const { isScrollToNewComment } = useScrollActions();

    const props = defineProps<{ item: IPostContainerDTO }>();
    const showAllImages = ref(false);
    const showShareDialog = ref(false);
    const readMore = ref(false);
    const emit = defineEmits<{
        (e: 'refreshPost', data: IPostContainerDTO): void;
    }>();

    const localLike = ref(false);
    const amount_lines = ref(0);

    onBeforeMount(async () => {
        if (props.item.likes.some(item => item.id === user.id)) {
            localLike.value = true;
        }
        amount_lines.value = countLines(props.item.post.body.trimEnd());
    });

    const smallScreen = ref(window.innerWidth < 640);

    window.onresize = () => {
        smallScreen.value = window.innerWidth < 640;
    };

    const openPanel = ref<boolean>(false);
    const mouseFocussed = ref(false);

    //only shows user panel if mouse stays focussed for a moment
    const panelTimer = () => setTimeout(() => (openPanel.value = mouseFocussed.value), 600);

    const showDeletePostDialog = ref(false);

    const doDeletePost = () => {
        deletePost(props.item);
        showDeletePostDialog.value = false;
    };

    const countLines = (body: string) => {
        try {
            return body.match(/[^\n]*\n[^\n]*/gi).length + 1;
        } catch (e) {
            return 0;
        }
    };

    const countComments = (total = 0, comments = props.item.replies) => {
        for (let comment of comments) {
            total++;
            if (comment.replies?.length > 0) total = countComments(total, comment.replies);
        }
        return total;
    };

    const showComments = ref(false);

    const showIsUserTyping = computed(() => {
        return props.item?.isTyping && props.item?.isTyping?.length !== 0 && showComments.value ? true : false;
    });

    const onInput = useDebounceFn(() => {
        setSomeoneIsTyping(props.item.post.id, props.item.owner.location, user.id.toString());
    }, 1000);

    const showImagePreview = ref(false);
    const imagePreviewSrc = ref<string | null>(null);

    const openImagePreview = image => {
        imagePreviewSrc.value = fetchPostAttachment(image);
        showImagePreview.value = true;
    };

    const avatarImg = computed(() => {
        return calcExternalResourceLink(`http://[${props.item.owner.location}]/api/v2/user/avatar/default`);
    });

    const fetchPostAttachment = (attachment: string) => {
        const owner = props.item.owner;
        const path = `${owner.id}/posts/${attachment}`;
        return calcExternalResourceLink(`http://[${owner.location}]/api/v2/files/${btoa(path)}`);
    };

    const timeAgo = time => {
        return moment(time).fromNow();
    };

    const messageInput = ref('');
    const postingCommentInProgress = ref(false);

    const handleAddComment = async (isReplyToComment: boolean = false, comment_id?: string, message?: string) => {
        if (postingCommentInProgress.value) return;
        const commentValue = isReplyToComment ? message : messageInput.value;
        if (!commentValue || commentValue === '' || !/\S/.test(commentValue)) return;

        postingCommentInProgress.value = true;
        await commentOnPost(commentValue, props.item, isReplyToComment, comment_id);
        messageInput.value = '';
        const post = await getSinglePost(props.item.post.id, props.item.owner.location);
        postingCommentInProgress.value = false;
        if (!isReplyToComment) {
            isScrollToNewComment(true);
        }
        emit('refreshPost', post);
    };

    const amount_likes = ref(props.item.likes.length);

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

    watch([showComments, amount_likes], () => {
        getSinglePost(props.item.post.id, props.item.owner.location);
    });

    const inputRef = ref(null);

    watch(showComments, () => {
        nextTick(() => {
            if (showComments.value) {
                inputRef.value.focus();
            }
        });
    });
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
