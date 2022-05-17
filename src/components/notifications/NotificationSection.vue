<template>
    <div style="z-index: 70" class="absolute w-80 right-0 bottom-0 flex flex-col items-end justify-end">
        <NotificationCard
            v-for="notification in notifications"
            :key="getKey(notification)"
            :notification="notification"
            class="w-full p-2"
            :class="`key${getKey(notification)}`"
        />
    </div>
</template>

<script lang="ts" setup>
    import { getKey, notifications } from '@/store/notificiationStore';
    import NotificationCard from '@/components/notifications/NotificationCard.vue';
</script>

<style scoped></style>
