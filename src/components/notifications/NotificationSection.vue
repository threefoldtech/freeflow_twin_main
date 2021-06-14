<template>
    <div class='absolute w-80 right-0 bottom-0 z-40 flex flex-col items-end justify-end'>
        <NotificationCard
            v-for='notification in notifications'
            :key='getKey(notification)'
            :notification='notification'
            class='w-full p-2'
            :class='`key${getKey(notification)}`'
        />
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue';
    import {
        getKey,
        notifications
    } from '@/store/notificiationStore';
    import NotificationCard from '@/components/notifications/NotificationCard.vue';

    export default defineComponent({
        name: 'NotificationSection',
        components: { NotificationCard },
        setup() {
            let i =0;
            return {
                notifications,
                getKey
            }
        }
    });
</script>

<style scoped>

</style>