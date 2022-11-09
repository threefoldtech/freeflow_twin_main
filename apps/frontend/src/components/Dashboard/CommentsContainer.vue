<template>
    <div ref="comments" class="bg-white w-full max-h-96 overflow-y-auto px-3 py-2 flex flex-col space-y-2">
        <PostComment
            @replyToComment="e => $emit('replyToComment', e)"
            @updateComments="e => $emit('updateComments', e)"
            :key="comment.id"
            v-for="comment in commentsSorted"
            :comment="comment"
        />
    </div>
</template>

<script setup lang="ts">
    import PostComment from '@/components/Dashboard/PostComment.vue';
    import { computed, watch, ref } from 'vue';
    import { IPostComment, IPostContainerDTO } from 'custom-types/post.type';
    import { useScrollState } from '@/store/scrollStore';

    const { scrollToNewComment } = useScrollState();

    const props = defineProps<{ comments: IPostComment[] }>();
    const emit = defineEmits<{
        (e: 'updateComments', post: IPostContainerDTO): void;
        (e: 'replyToComment', { input, comment_id }: { input: string; comment_id: string }): void;
    }>();

    const comments = ref(null);

    const commentsSorted = computed(() => {
        return props.comments.sort(function (a, b) {
            return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
        });
    });

    watch(scrollToNewComment, () => {
        if (scrollToNewComment.value) {
            comments.value.scrollTop = 0;
            scrollToNewComment.value = false;
        }
    });
</script>

<style scoped></style>
