<template>
    <div
        :class="{ 'ml-10': comment.type === CommentType.COMMENT_REPLY }"
        class="flex items-center space-x-2 relative"
        @mouseover="showDots = true"
        @mouseleave="showDots = false"
    >
        <VMenu placement="top" :autoHide="false">
            <AvatarImg
                :id="comment.owner.id"
                :contact="comment.owner"
                :showOnlineStatus="false"
                :small="true"
                alt="avatar"
            />

            <template #popper>
                <keep-alive>
                    <CommentHoverPanel :avatar="avatarImg" :comment="comment" />
                </keep-alive>
            </template>
        </VMenu>

        <div class="flex items-center justify-center space-x-2 relative">
            <div class="block">
                <div ref="htmlRef" class="block lg:hidden bg-gray-100 w-auto rounded-lg px-2 py-2">
                    <div class="font-semibold">
                        <p class="text-sm font-semibold">
                            {{ comment.owner.id }}
                        </p>
                    </div>
                    <div class="text-sm">
                        {{ comment.body }}
                    </div>
                </div>
                <div class="hidden lg:block bg-gray-100 w-auto rounded-lg px-2 py-2">
                    <div class="font-semibold">
                        <p class="text-sm font-semibold">
                            {{ comment.owner.id }}
                        </p>
                    </div>
                    <div class="text-sm">
                        {{ comment.body }}
                    </div>
                </div>
                <div class="flex justify-start items-center text-sm w-full">
                    <div class="font-semibold text-gray-700 px-2 flex items-center justify-center space-x-1">
                        <a @click="handleLikeComment" class="hover:underline" href="#">
                            <small>{{ liked ? 'Unlike' : 'Like' }}</small>
                        </a>
                        <small v-if="comment.type === CommentType.COMMENT" class="self-center">.</small>
                        <a v-if="comment.type === CommentType.COMMENT" class="hover:underline" href="#" @click="reply">
                            <small>Reply</small>
                        </a>
                        <small v-if="comment.type === CommentType.COMMENT" class="self-center">.</small>
                        <small>{{ moment(comment.createdOn).fromNow() }}</small>
                    </div>
                </div>
            </div>
            <div v-if="comment.likes.length >= 1" class="absolute -bottom-1 -right-14 flex items-center">
                <div class="w-14 h-7 bg-white shadow flex items-center justify-center rounded-full cursor-pointer">
                    <ThumbUpIcon class="text-primary w-4 h-4" />
                    <span class="text-xs ml-2 font-medium">{{ comment.likes.length }}</span>
                </div>
            </div>
        </div>

        <Popover
            v-if="showDots && comment?.owner.id === user.id"
            v-slot="{ open }"
            class="hidden lg:block relative z-30"
        >
            <PopoverButton
                :class="open ? '' : 'text-opacity-90'"
                class="items-center text-base font-medium text-white rounded-md group hover:text-opacity-100 focus:outline-none"
            >
                <DotsHorizontalIcon
                    v-if="showDots && comment?.owner.id === user.id"
                    class="text-gray-400 mb-5 w-5 h-5 cursor-pointer hover:text-gray-600"
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
                <PopoverPanel v-slot="{ close }" class="absolute z-50 top-0 left-5">
                    <div class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div class="relative grid gap-8 bg-white px-6 py-4 rounded-lg">
                            <div
                                v-if="comment.owner.id === user.id"
                                class="flex items-center cursor-pointer text-gray-500 hover:text-red-900"
                                @click="
                                    showDeleteCommentDialog = true;
                                    close();
                                "
                            >
                                <TrashIcon class="w-6 mr-4" />
                                <p class="w-12">Delete</p>
                            </div>
                        </div>
                    </div>
                </PopoverPanel>
            </transition>
        </Popover>
    </div>
    <ReplyComment
        v-for="reply in commentsSorted"
        v-if="commentsSorted?.length > 0 && CommentType.COMMENT"
        :key="reply.id"
        :comment="reply"
        @updateComments="e => $emit('updateComments', e)"
    />
    <form
        v-if="showReplyInput"
        class="relative flex items-center pl-20 flex-start w-full"
        @submit.prevent="handleReplyForm"
    >
        <div class="pr-1">
            <AvatarImg :id="user.id" :showOnlineStatus="false" :xSmall="true" />
        </div>
        <input
            v-model="replyInput"
            ref="inputField"
            class="text-xs font-medium rounded-lg border border-gray-300 outline-none focus:ring-0 ring-0 w-2/3"
            placeholder="Type your message here"
            type="text"
            maxlength="500"
        />
        <button type="submit" class="bg-transparent ml-2">
            <span class="material-symbols-rounded text-primary text-4xl"> send </span>
        </button>
    </form>
    <MainActionsOverlay
        style="margin-top: 0; margin-bottom: 0"
        :model-value="isMobileMenuActive"
        @update-model-value="isMobileMenuActive = false"
    >
        <template #content>
            <div class="pt-6 pb-8 flex flex-col">
                <div class="flex justify-around pb-6">
                    <div
                        v-if="comment.owner.id === user.id"
                        class="flex flex-col items-center"
                        @click="
                            showDeleteCommentDialog = true;
                            isMobileMenuActive = false;
                        "
                    >
                        <div class="inline-flex items-center p-2.5 border border-gray-400 rounded-full">
                            <TrashIcon aria-hidden="true" class="h-6 w-6 text-gray-400" />
                        </div>
                        <p class="mt-1">Delete</p>
                    </div>
                    <div
                        class="flex flex-col items-center"
                        @click="
                            () => {
                                showReplyInput = true;
                                isMobileMenuActive = false;
                            }
                        "
                    >
                        <div class="inline-flex items-center p-2.5 border border-gray-400 rounded-full">
                            <ReplyIcon aria-hidden="true" class="h-6 w-6 text-gray-400" />
                        </div>
                        <p class="mt-1">Reply</p>
                    </div>
                </div>
                <button
                    type="button"
                    @click="isMobileMenuActive = false"
                    className="inline-flex items-center justify-center mx-12 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
            </div>
        </template>
    </MainActionsOverlay>

    <Alert v-if="showDeleteCommentDialog" :showAlert="showDeleteCommentDialog" @close="showDeleteCommentDialog = false">
        <template #title> Deleting comment</template>
        <template #content>Do you really want to delete your comment?</template>
        <template #actions>
            <button
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                @click="handleDeleteComment"
            >
                Delete
            </button>
            <button
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                @click="showDeleteCommentDialog = false"
            >
                Cancel
            </button>
        </template>
    </Alert>
</template>

<script lang="ts" setup>
    import { computed, nextTick, onBeforeMount, ref } from 'vue';
    import CommentHoverPanel from '@/components/Dashboard/CommentHoverPanel.vue';
    import ReplyComment from '@/components/Dashboard/PostComment.vue';
    import moment from 'moment';
    import { ThumbUpIcon, DotsHorizontalIcon, TrashIcon, ReplyIcon } from '@heroicons/vue/solid';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { myYggdrasilAddress, useAuthState } from '@/store/authStore';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { CommentType, IPostComment, IPostContainerDTO } from 'custom-types/post.type';
    import { deleteComment, getSinglePost, likeComment } from '@/services/socialService';
    import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
    import Alert from '@/components/Alert.vue';
    import { onLongPress } from '@vueuse/core';
    import MainActionsOverlay from '@/components/fileBrowser/MainActionsOverlay.vue';

    const props = defineProps<{ comment: IPostComment }>();
    const showReplyInput = ref<boolean>(false);
    const replyInput = ref<string>('');
    const myLocation = ref<string>('');
    const { user } = useAuthState();
    const showDots = ref<boolean>(false);
    const showDeleteCommentDialog = ref<boolean>(false);

    const htmlRef = ref<HTMLElement | null>(null);
    const isMobileMenuActive = ref(false);

    const onLongPressCallbackHook = (e: PointerEvent) => {
        isMobileMenuActive.value = true;
    };

    onLongPress(htmlRef, onLongPressCallbackHook, { modifiers: { prevent: true }, delay: 1000 });

    const emit = defineEmits<{
        (e: 'updateComments', post: IPostContainerDTO): void;
        (e: 'replyToComment', { input, comment_id }: { input: string; comment_id: string }): void;
    }>();

    const liked = computed(() => {
        return props.comment.likes.map(l => l.id).includes(user.id.toString());
    });

    onBeforeMount(async () => {
        myLocation.value = await myYggdrasilAddress();
    });

    const commentsSorted = computed(() => {
        return props.comment?.replies?.sort(function (a, b) {
            return new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime();
        });
    });

    const handleDeleteComment = async () => {
        const { post } = props.comment;

        await deleteComment(post.id, props.comment.id, post.owner.location);
        const res = await getSinglePost(post.id, post.owner.location);
        showDeleteCommentDialog.value = false;

        emit('updateComments', res);
    };

    const avatarImg = computed(() => {
        return calcExternalResourceLink(`http://[${props.comment.owner.location}]/api/v2/user/avatar/default`);
    });

    const handleReplyForm = () => {
        if (replyInput.value === '') return;

        emit('replyToComment', {
            input: replyInput.value,
            comment_id: props.comment.id,
        });
        replyInput.value = '';
        showReplyInput.value = false;
    };

    const handleLikeComment = async () => {
        const { post, id, isReplyToComment, replyTo } = props.comment;
        await likeComment(post.id, post.owner.location, id, isReplyToComment, replyTo);
        const res = await getSinglePost(post.id, post.owner.location);

        emit('updateComments', res);
    };

    const inputField = ref<HTMLInputElement>();

    const reply = () => {
        if (props.comment.type === CommentType.COMMENT) {
            showReplyInput.value = !showReplyInput.value;
            nextTick(() => inputField.value.focus());
        }
    };
</script>

<style>
    .v-popper--theme-menu .v-popper__inner {
        background-color: transparent !important;
        border-color: transparent !important;
    }
</style>
