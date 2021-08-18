<template>
    <div>
        <div
            :class="{
                'pt-2 px-4 ': !preventRecursion,
            }"
            class="quote"
        >
            <div v-if="!preventRecursion" class="pl-4 border-l-2 border-gray-400 my-message:border-icon">
                <div v-if="message.body.quotedMessage !== 'SYSTEM'" class="font-bold my-message:text-icon">
                    {{ message.body.quotedMessage.from }}
                </div>
                <MessageContent :message="message.body.quotedMessage" preventRecursion></MessageContent>
            </div>
        </div>

        <div class="px-4 py-2 pr-8">{{ message.body.message }}</div>
    </div>
</template>

<script lang="ts" setup>
    import MessageContent from '../MessageContent.vue';

    defineProps({
        message: { type: Object, required: true },
        preventRecursion: {
            type: Boolean,
            default: false,
            required: false,
        },
    });
</script>
