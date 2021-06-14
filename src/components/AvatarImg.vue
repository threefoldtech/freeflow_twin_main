<template>
    <div
        class="grid relative"
        :class="{
            'h-16 w-16': large,
            'h-12 w-12': !small && !xsmall,
            'h-8 w-8': small,
            'h-6 w-6': xsmall,
        }"
    >
        <div
            class="bg-icon rounded-full"
            :style="`background:url(${src}) no-repeat center/cover`"
            :class="{
                'h-16 w-16': large,
                'h-12 w-12': !small && !xsmall && !large,
                'h-8 w-8': small,
                'h-6 w-6': xsmall,
            }"
        ></div>
        <div
            v-if="showOnlineStatus"
            class="h-3 w-3 bg-gray-300 rounded-full absolute bottom-0 right-0 transition-all"
            :class="{
                'bg-red-500': status && !status.isOnline,
                'bg-green-500': status && status.isOnline,
            }"
        ></div>

        <div
            v-if="unreadMessagesAmount > 0"
            class="absolute -top-1 -right-1 bg-accent h-4 w-4 rounded-full text-xs z-10 align-middle text-center text-white"
        >
            {{ unreadMessagesAmount }}
        </div>
    </div>
</template>

<script lang="ts">
    import { computed } from 'vue';
    import { startFetchStatusLoop, statusList } from '@/store/statusStore';
    import { calcExternalResourceLink } from '../services/urlService';

    export default {
        name: 'AvatarImg',
        props: {
            id: { required: true },
            showOnlineStatus: {
                required: false,
                default: true,
                type: Boolean,
            },
            unreadMessagesAmount: Number,
            large: { required: false, default: false, type: Boolean },
            small: { required: false, default: false, type: Boolean },
            xsmall: { required: false, default: false, type: Boolean },
        },
        setup(props) {
            // startFetchStatusLoop(props.id)

            const status = computed(() => {
                return statusList[<string>props.id];
            });

            const src = computed(() => {
                if (!status.value || !status.value.avatar) {
                    return `https://avatars.dicebear.com/4.5/api/jdenticon/${encodeURI(
                        <string>props.id
                    )}.svg?m=14&b=%23ffffff`;
                }
                return calcExternalResourceLink(status.value.avatar);
            });

            return {
                src,
                status,
            };
        },
    };
</script>
