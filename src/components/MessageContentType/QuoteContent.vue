<template>
    <div>
        <div
            class="quote"
            :class="{
                'pt-2 px-4 ': !preventRecursion,
            }"
        >
            <div class="border-l-2 border-gray-400 my-message:border-icon " v-if="!preventRecursion">
                <div class="pl-4 font-bold my-message:text-icon" v-if="message.body.quotedMessage !== 'SYSTEM'">
                    {{ message.body.quotedMessage.from }}
                </div>
                <MessageContent :message="message.body.quotedMessage" preventRecursion></MessageContent>
            </div>
        </div>

        <div class="px-4 py-2 pr-8">{{ message.body.message }}</div>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import MessageContent from '../MessageContent.vue';

    export default defineComponent({
        name: 'QuoteContent',
        components: { MessageContent },
        props: {
            message: { type: Object, required: true },
            preventRecursion: {
                type: Boolean,
                default: false,
                required: false,
            },
        },
    });
</script>
