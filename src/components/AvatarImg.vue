<template>
    <div
        :class="{
            'h-16 w-16': large,
            'h-12 w-12': !small && !xsmall && !large,
            'h-10 w-10': small,
            'h-8 w-8': xsmall,
        }"
        class="grid relative"
    >
        <div
            :class="{
                'h-16 w-16': large,
                'h-12 w-12': !small && !xsmall && !large,
                'h-10 w-10': small,
                'h-8 w-8': xsmall,
            }"
            :style="`background:url(${src}) no-repeat center/cover`"
            class="bg-icon rounded-full"
        ></div>
        <div
            v-if="showOnlineStatus"
            :class="{
                'bg-red-500': status && !status.isOnline,
                'bg-green-500': status && status.isOnline,
            }"
            class="h-3 w-3 bg-gray-300 rounded-full absolute ring-2 ring-white bottom-0 right-0 transition-all"
        ></div>

        <div
            v-if="unreadMessagesAmount > 0"
            class="absolute -top-1 -right-1 bg-accent-300 h-4 w-4 rounded-full text-xs z-10 align-middle text-center text-white"
        >
            {{ unreadMessagesAmount }}
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed, onBeforeMount } from 'vue';
    import { fetchStatus, statusList } from '@/store/statusStore';
    import { calcExternalResourceLink } from '../services/urlService';
    import { useAuthState } from '@/store/authStore';

    interface IProps {
        id: string;
        showOnlineStatus?: boolean;
        unreadMessagesAmount?: number;
        large?: boolean;
        small?: boolean;
        xsmall?: boolean;
    }

    onBeforeMount(async () => {
        const { user } = useAuthState();
        await fetchStatus(user.id);
    });

    const props = withDefaults(defineProps<IProps>(), {
        showOnlineStatus: true,
        large: false,
        small: false,
        xsmall: false,
    });

    const status = computed(() => {
        return statusList[<string>props.id];
    });

    const src = computed(() => {
        if (!status.value || !status.value.avatar) {
            return `https://avatars.dicebear.com/4.5/api/jdenticon/${encodeURI(<string>props.id)}.svg?m=14&b=%23ffffff`;
        }
        return calcExternalResourceLink(status.value.avatar);
    });
</script>
