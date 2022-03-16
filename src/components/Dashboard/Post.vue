<template>
    <div v-if='showImagePreview'
         class='inset-0 bg-black bg-opacity-50 w-full h-full flex justify-center items-center z-50 fixed p-8'
         @click='showImagePreview = false'>
        <XIcon class='absolute right-4 top-4 w-12 h-12 cursor-pointer text-white z-50'
               @click='showImagePreview = false' />
        <img :src='imagePreviewSrc' class='pointer-events-none z-50' @click.stop />
    </div>
    <SharePostDialog v-if='showShareDialog' :avatarImg='avatarImg' :item='item' @close='showShareDialog = false'
                     class='z-50' />
    <div class='bg-white my-5 rounded'>
        <div class='p-6'>
            <div>
                <div class='relative'>
                    <TransitionRoot :show='openPanel'
                                    class='absolute z-50 -top-44 -left-20'
                                    enter='transition-opacity duration-150'
                                    enter-from='opacity-0'
                                    enter-to='opacity-100'
                                    leave='transition-opacity duration-250'
                                    leave-from='opacity-100'
                                    leave-to='opacity-0'>
                        <CommentHoverPanel v-if='openPanel' :avatar='avatarImg' :comment='item'
                                           @mouseleave='mouseFocussed = false; openPanel = false'
                                           @mouseover='mouseFocussed = true;panelTimer()' />
                    </TransitionRoot>
                    <div class='flex items-center'>
                        <div class='relative mr-4 cursor-pointer'
                             @mouseover='mouseFocussed = true;panelTimer()'
                             @mouseleave='mouseFocussed = false; panelTimer()'>
                            <img :src='avatarImg' class='w-12 h-12 rounded-full' alt='avatar' />
                        </div>
                        <div>
                            <p class='text-base font-medium cursor-pointer hover:underline'
                               @click='showComingSoonToUhuru = true'
                               @mouseover='mouseFocussed = true;panelTimer()'
                               @mouseleave='mouseFocussed = false; panelTimer()'>
                                {{ item.owner.id }}
                            </p>
                            <p class='text-xs text-gray-400'>{{ timeAgo(item.post.createdOn) }}</p>
                        </div>
                    </div>
                    <div class='group absolute right-0 top-0 z-40'>
                        <Popover v-slot='{ open }' class='relative z-40'>
                            <PopoverButton
                                :class="open ? '' : 'text-opacity-90'"
                                class='items-center text-base font-medium text-white bg-orange-700 rounded-md group hover:text-opacity-100 focus:outline-none
                                    focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'>
                                <DotsVerticalIcon
                                    class='text-gray-400 w-5 h-5 cursor-pointer group-hover:text-gray-600'
                                />
                                <ChevronDownIcon
                                    :class="open ? '' : 'text-opacity-70'"
                                    aria-hidden='true'
                                    class='w-5 h-5 ml-2 text-orange-300 transition duration-150 ease-in-out group-hover:text-opacity-80' />
                            </PopoverButton>
                            <transition
                                enter-active-class='transition duration-200 ease-out'
                                enter-from-class='translate-y-1 opacity-0'
                                enter-to-class='translate-y-0 opacity-100'
                                leave-active-class='transition duration-150 ease-in'
                                leave-from-class='translate-y-0 opacity-100'
                                leave-to-class='translate-y-1 opacity-0'
                            >
                                <PopoverPanel
                                    class='absolute z-50 w-64 px-4 transform -translate-x-1/2 left-1/2'>
                                    <div class='rounded-lg shadow-lg ring-1 ring-black ring-opacity-5'>
                                        <div class='relative grid gap-8 bg-white p-6 rounded'>
                                            <a
                                                v-for='item in solutions'
                                                :key='item.name'
                                                :href='item.href'
                                                class='items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50'
                                                @click='() => item.action()'>
                                                <div class='w-full'>
                                                    <p class='text-sm font-medium text-gray-900 w-full'>
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
            <div class='mt-4 text-gray-600'>
                <p class='my-2 break-words'>{{ item.post.body }}</p>
                <div :class="{'grid-cols-1' : item.images.length === 1}" class='grid grid-cols-2 my-4 gap-1'>
                    <div v-for='(image,idx) in item.images.slice(0,showAllImages ? item.images.length : 4)'
                         :key='idx' class='relative overflow-hidden cursor-pointer h-64 rounded'>
                        <div v-if='!showAllImages && idx === 3 && item.images.length >= 5'
                             class='absolute inset-0 bg-black w-full h-full bg-opacity-50 flex justify-center items-center'>
                            <p class='text-white text-2xl'>+{{ item.images.length - 4 }}</p>
                        </div>
                        <img :src='fetchPostImage(image)' class='object-cover rounded'
                             @click='openImagePreview(image)' />
                    </div>
                </div>
                <p v-if='item.images.length > 4' class='w-full text-center my-3 cursor-pointer font-medium'
                   @click='() => showAllImages = !showAllImages'>{{ showAllImages ? 'Hide images' : 'Show all images'
                    }}</p>
            </div>
            <div>
                <div class='flex items-center w-full'>
                    <div class='hidden flex -space-x-2 overflow-hidden'>
                        <img
                            alt=''
                            class='inline-block h-8 w-8 rounded-full ring-2 ring-white'
                            src='https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                        />
                        <img
                            alt=''
                            class='inline-block  h-8 w-8 rounded-full ring-2 ring-white'
                            src='https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                        />
                        <img
                            alt=''
                            class='inline-block  h-8 w-8 rounded-full ring-2 ring-white'
                            src='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80'
                        />
                    </div>
                    <div class='hidden ml-4'>
                        <p class='font-medium text-primary flex text-xs'>
                            <span v-for='(name, idx) in props.item.persons' :key='name'>
                                {{ name }}<span v-if='idx === 0' class='mr-1'>,</span>
                            </span>
                        </p>
                        <p v-if='false' class='text-gray-600 text-xs'>and {{ Math.abs(props.item.comments - 2) }} other
                            liked
                            this</p>
                    </div>
                    <div class='flex items-center'>
                        <HeartIconSolid class='hidden text-red-500 w-5 h-5 mr-2' />
                        <p class='text-gray-600 font-medium flex-shrink-0 text-sm'>{{ amount_likes }} {{
                                amount_likes === 1 ? 'Like' : 'Likes'
                            }}</p>
                    </div>
                    <p class='text-gray-600 mr-0 ml-auto cursor-pointer text-md' @click='showComments = !showComments'>
                        {{ countComments() }} Comments
                    </p>
                </div>
            </div>
        </div>
        <div class='border-t-2 flex space-x-8 p-4'>
            <div
                class='flex items-center cursor-pointer'
                @click='like'
            >
                <TransitionRoot :show='!localLike'
                                enter='transition-opacity duration-150'
                                enter-from='opacity-0'
                                enter-to='opacity-100'
                                leave='transition-opacity duration-250'
                                leave-from='opacity-100'
                                leave-to='opacity-0'>
                    <HeartIcon v-if='!localLike' class='w-6 text-gray-500 mr-4' />
                </TransitionRoot>
                <TransitionRoot :show='localLike'
                                enter='transition-opacity duration-150'
                                enter-from='opacity-0'
                                enter-to='opacity-100'
                                leave='transition-opacity duration-250'
                                leave-from='opacity-100'
                                leave-to='opacity-0'>
                    <HeartIconSolid v-if='localLike' class='w-6 text-red-500 mr-4' />
                </TransitionRoot>
                <p class='text-gray-500 w-11'>
                    {{ localLike ? 'Liked' : 'Like' }}
                </p>

            </div>
            <div
                class='flex items-center cursor-pointer'
                @click='showComments = !showComments'
            >
                <ChatAltIcon class='w-6 text-gray-500 mr-4' />
                <p class='text-gray-500'>
                    Comment
                </p>
            </div>
            <div
                class='flex items-center cursor-pointer'
                @click='showShareDialog = true'
            >
                <ShareIcon class='w-6 text-gray-500 mr-4' />
                <p class='text-gray-500'>
                    Share
                </p>
            </div>
        </div>
        <div>
            <TransitionRoot :show='showComments'
                            enter='transition-opacity duration-150'
                            enter-from='opacity-0'
                            enter-to='opacity-100'
                            leave='transition-opacity duration-250'
                            leave-from='opacity-100'
                            leave-to='opacity-0'>
                <form v-if='showComments' :class="{'opacity-50' : postingCommentInProgress}"
                      class='px-2 py-2 flex items-center space-x-1'
                      @submit.prevent='handleAddComment(false)'>
                    <div class=''><img :src='myAvatar' class='h-10 rounded-full' alt='avatar'></div>
                    <input :ref='inputRef' v-model='messageInput'
                           :disabled='postingCommentInProgress'
                           class='text-xs font-medium rounded-full bg-gray-200 border-none outline-none focus:ring-0 ring-0 px-4 h-10 flex-grow'
                           placeholder='Type your message here'
                           type='text'
                           @focus='focusInput' />
                    <input
                        class='cursor-pointer text-xs font-medium rounded-full bg-accent-800 hover:bg-accent-600 text-white border-none outline-none flex-grow-0 w-24 h-10'
                        type='submit'
                        value='Send' />
                </form>

                <CommentsContainer v-if='showComments && item.replies.length > 0'
                                   :comments='item.replies' :postingCommentInProgress='postingCommentInProgress'
                                   class='border-t-2 rounded-b-lg' :class="{'max-h-[35rem]' : $route.name === 'single'}"
                                   @replyToComment='e => handleAddComment(true, e.comment_id, e.input)' />
            </TransitionRoot>
            <TransitionRoot :show='showIsUserTyping'
                            as='div'
                            class='flex items-center px-4'
                            enter='transition-opacity duration-150'
                            enter-from='opacity-0'
                            enter-to='opacity-100'
                            leave='transition-opacity duration-250'
                            leave-from='opacity-100'
                            leave-to='opacity-0'>
                <div class='ds-preloader-block'>
                    <div class='ds-preloader-block__loading-bubble'></div>
                    <div class='ds-preloader-block__loading-bubble'></div>
                    <div class='ds-preloader-block__loading-bubble'></div>
                </div>
                <p class='px-4 py-2 text-sm font-medium text-gray-500'>Someone is typing</p>
            </TransitionRoot>
        </div>
    </div>
</template>

<script lang='ts' setup>
    import {
        PhotographIcon,
        PencilAltIcon,
        FilmIcon,
        DotsVerticalIcon,
        HeartIcon as HeartIconSolid, XIcon,
    } from '@heroicons/vue/solid';
    import { HeartIcon, ChatAltIcon, ShareIcon } from '@heroicons/vue/outline';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState, myYggdrasilAddress } from '@/store/authStore';
    import { ref, computed, onMounted, onBeforeMount, watch } from 'vue';
    import moment from 'moment';
    import { Popover, PopoverButton, PopoverPanel, TransitionRoot } from '@headlessui/vue';
    import { ChevronDownIcon } from '@heroicons/vue/solid';
    import { showComingSoonToUhuru } from '@/services/dashboardService';
    import CommentsContainer from '@/components/Dashboard/CommentsContainer.vue';
    import MarkdownIt from 'markdown-it';
    import { uuidv4 } from '@/common';
    import { SOCIAL_POST, LIKE_STATUS } from '@/store/socialStore';
    import axios from 'axios';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { commentOnPost, getAllPosts, getSinglePost, likePost, setSomeoneIsTyping } from '@/services/socialService';
    import SharePostDialog from '@/components/Dashboard/SharePostDialog.vue';
    import CommentHoverPanel from '@/components/Dashboard/CommentHoverPanel.vue';

    const props = defineProps<{ item: SOCIAL_POST }>();
    const inputRef = ref<HTMLInputElement>(null);
    const messageInput = ref<string>('');
    const showComments = ref<boolean>(false);
    const showAllImages = ref<boolean>(false);
    const amount_likes = ref<number>(props.item.likes.length);
    const myLocation = ref<string | null>(null);
    const showImagePreview = ref<boolean>(false);
    const imagePreviewSrc = ref<string | null>(null);
    const showShareDialog = ref<boolean>(false);
    const openPanel = ref<boolean>(false);
    const mouseFocussed = ref(false);
    const postingCommentInProgress = ref<boolean>(false);
    const { user } = useAuthState();
    const emit = defineEmits(['refreshPost']);

    //only shows user panel if mouse stays focussed for a moment
    const panelTimer = () => setTimeout(() => openPanel.value = mouseFocussed.value, 600);

    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
    });

    watch([showComments, amount_likes], () => {
        getSinglePost(props.item.post.id, props.item.owner.location);
    });

    const renderMarkdown = content => {
        return md.render(content);
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

    interface IProps {
        item: {
            id: string;
            content_html: string;
            url: string;
            title: string;
            date_modified: Date;
            likes: number;
            comments: number;
            persons: string[];
            author: string;
        };
    }

    watch(messageInput, async (n, o) => {
        if (n.length > o.length) {
            await setSomeoneIsTyping(props.item.post.id, props.item.owner.location);

        }
    });

    const uuid1 = uuidv4();

    const localLike = ref(false);

    onBeforeMount(async () => {
        myLocation.value = await myYggdrasilAddress();
        const { user } = useAuthState();
        if (props.item.likes.some(item => item.id === user.id)) {
            localLike.value = true;
        }
    });

    const openImagePreview = (image) => {
        imagePreviewSrc.value = fetchPostImage(image);
        showImagePreview.value = true;
    };

    const avatarImg = computed(() => {
        return calcExternalResourceLink(`http://[${props.item.owner.location}]/api/user/avatar/default`);
    });

    const myAvatar = computed(() => {
        return calcExternalResourceLink(`http://[${myLocation.value}]/api/user/avatar/default`);
    });

    const fetchPostImage = (image) => {
        return calcExternalResourceLink(`http://[${props.item.owner.location}]/api/posts/download/${btoa(image.path)}`);
    };

    const timeAgo = time => {
        return moment(time).fromNow();
    };

    const handleAddComment = async (isReplyToComment: boolean = false, comment_id?: string, message?: string) => {
        if (postingCommentInProgress.value) return;
        const comment_value = isReplyToComment ? message : messageInput.value;
        if (!comment_value || comment_value === '' || !/\S/.test(comment_value)) return;
        postingCommentInProgress.value = true;
        const comment = await commentOnPost(comment_value, props.item, isReplyToComment, comment_id);
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

    const solutions = [
        {
            action: () => showComingSoonToUhuru.value = true,
            name: 'Send private message',
            description: 'Measure actions your users take',
            href: '##',
            icon: `
            <svg
              width='48'
              height='48'
              viewBox='0 0 48 48'
              fill='none'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect width='48' height='48' rx='8' fill='#FFEDD5' />
              <path
                d='M24 11L35.2583 17.5V30.5L24 37L12.7417 30.5V17.5L24 11Z'
                stroke='#FB923C'
                stroke-width='2'
              />
              <path
                fill-rule='evenodd'
                clip-rule='evenodd'
                d='M16.7417 19.8094V28.1906L24 32.3812L31.2584 28.1906V19.8094L24 15.6188L16.7417 19.8094Z'
                stroke='#FDBA74'
                stroke-width='2'
              />
              <path
                fill-rule='evenodd'
                clip-rule='evenodd'
                d='M20.7417 22.1196V25.882L24 27.7632L27.2584 25.882V22.1196L24 20.2384L20.7417 22.1196Z'
                stroke='#FDBA74'
                stroke-width='2'
              />
            </svg>
          `,
        },
        {
            action: () => showShareDialog.value = true,
            name: 'Share with a friend',
            description: 'Create your own targeted content',
            href: '##',
            icon: `
            <svg
              width='48'
              height='48'
              viewBox='0 0 48 48'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect width='48' height='48' rx='8' fill='#FFEDD5' />
              <path
                d='M28.0413 20L23.9998 13L19.9585 20M32.0828 27.0001L36.1242 34H28.0415M19.9585 34H11.8755L15.9171 27'
                stroke='#FB923C'
                stroke-width='2'
              />
              <path
                fill-rule='evenodd'
                clip-rule='evenodd'
                d='M18.804 30H29.1963L24.0001 21L18.804 30Z'
                stroke='#FDBA74'
                stroke-width='2'
              />
            </svg>`,
        },
    ];


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
        animation-delay: .18s;
    }

    .ds-preloader-block__loading-bubble:nth-child(3) {
        animation-delay: .36s;
    }
</style>
