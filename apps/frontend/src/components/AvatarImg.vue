<template>
    <div
        :class="{
            'h-16 w-16': large,
            'h-12 w-12': !small && !xSmall && !large,
            'h-10 w-10': small,
            'h-8 w-8': xSmall,
        }"
        class="grid relative"
    >
        <img
            :class="{
                'h-16 w-16': large,
                'h-12 w-12': !small && !xSmall && !large,
                'h-10 w-10': small,
                'h-8 w-8': xSmall,
            }"
            class="bg-icon rounded-full focus:outline-none focus-visible:outline-none"
            alt="avatar"
            :src="src"
        />
        <div
            v-if="showOnlineStatus"
            :class="{
                'bg-red-500': status && !status.isOnline,
                'bg-green-500': status && status.isOnline,
            }"
            class="h-3 w-3 rounded-full absolute ring-2 ring-white bottom-0 right-0 transition-all"
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
    import { statusList, startFetchStatus, watchingUsers, fetchStatus } from '@/store/statusStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { Contact, GroupContact } from '@/types';
    import { useAuthState } from '@/store/authStore';

    interface IProps {
        id: string;
        contact?: Contact | GroupContact;
        showOnlineStatus?: boolean;
        unreadMessagesAmount?: number;
        large?: boolean;
        small?: boolean;
        xSmall?: boolean;
    }

    const props = withDefaults(defineProps<IProps>(), {
        showOnlineStatus: true,
        large: false,
        small: false,
        xSmall: false,
    });

    onBeforeMount(async () => {
        const { user } = useAuthState();
        await fetchStatus(user.id);
        const contact: Contact = {
            id: props.id,
            location: watchingUsers[props.id]?.location ?? props.contact?.location,
        };
        if (!statusList[props.id] && contact.location) {
            await startFetchStatus(contact);
        }
    });

    const status = computed(() => {
        return statusList[props.id];
    });

    const src = computed(() => {
        if (!status.value || !status.value.avatar)
            return `https://avatars.dicebear.com/4.5/api/jdenticon/${encodeURI(<string>props.id)}.svg?m=14&b=%23ffffff`;

        return calcExternalResourceLink(status.value.avatar);
    });
</script>
