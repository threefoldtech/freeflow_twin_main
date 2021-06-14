<template>

    <div class='flex flex-row 2-full'>
        <div class='px-1 text-red-500' v-if='notification.status === Status.Error'>
            <i class='far fa-times-circle' />
        </div>
        <div class='px-1 text-green-500' v-else-if='notification.status === Status.Success'>
            <i class='far fa-check-circle' />
        </div>
        <div class='px-1 text-gray-500' v-else>
            <i class='fas fa-info-circle' />
        </div>
        <div class='ml-2 mr-6 w-full overflow-hidden overflow-ellipsis'>
            <span class='font-semibold w-full'>{{ notification.title }}</span>
            <span class='text-gray-500 w-full block'>{{ notification.text }}</span>
            <div class='pt-1 w-full flex items-center'>
                <div class='flex items-center justify-between mr-2'>
            <span
                class='text-xs font-semibold inline-block'
                :class='{
                    "text-green-500": notification.status === Status.Success,
                    "text-red-500": notification.status === Status.Error,
                    "text-blue-500": notification.status === Status.Info,
                }'
            >
              {{ getProgress }}
            </span>
                </div>
                <div
                    class='overflow-hidden h-2 text-xs flex rounded flex-1'
                    :class='{
                "bg-green-200": notification.status === Status.Success,
                "bg-red-200": notification.status === Status.Error,
                "bg-blue-200": notification.status === Status.Info,
            }'
                >
                    <div
                        :style='{width: getPercentage + "%"}'
                        class='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center '
                        :class='{
                    "bg-green-500": notification.status === Status.Success,
                    "bg-red-500": notification.status === Status.Error,
                    "bg-blue-500": notification.status === Status.Info,
                }'
                    >

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
    import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
    import { NotificationType, ProgressNotification, Status } from '@/types/notifications';

    export default defineComponent({
        name: 'ProgressNotification',
        props: {
            notification: {
                type: Object as PropType<ProgressNotification>,
                required: true,
            },
        },
        setup(props) {
            const progress = {
                value: props.notification.progress,
            };
            const getPercentage = computed(() => {
                if (props.notification.max === 1)
                    return ~~(progress.value * 100);

                return ~~((progress.value / props.notification.max) * 100);
            });

            const getProgress = computed(() => {
                if (props.notification.max === 1)
                    return `${~~(progress.value * 100)}%`;

                return `${progress.value}/${props.notification.max}`;
            });


            return {
                getProgress,
                getPercentage,
                progress,
                Status,
            };
        },
    });
</script>

<style scoped>

</style>