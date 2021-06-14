<template>
    <div class='flex flex-row'>
        <div class='px-1 text-red-500' v-if='notification.status === Status.Error'>
            <i class='far fa-times-circle' />
        </div>
        <div class='px-1 text-green-500' v-else-if='notification.status === Status.Success'>
            <i class='far fa-check-circle' />
        </div>
        <div class='px-1 text-gray-500' v-else>
            <i class='fas fa-info-circle' />
        </div>
        <div class='ml-2 mr-6'>
            <span class='font-semibold'>{{notification.title}}</span>
            <span class='block text-gray-500'>{{notification.text}}</span>
        </div>
    </div>
</template>

<script lang='ts'>
    import { Notification, Status } from '@/types/notifications';
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'InfoNotification',
        props: {
            notification: {
                type: Notification,
                required: true,
            },
        },
        setup() {
            return {
                Status
            };
        },
    });
</script>

<style scoped>

</style>