<template>
    <div class="flex flex-row 2-full">
        <div v-if="notification.status === Status.Error" class="px-1 text-red-500">
            <i class="far fa-times-circle" />
        </div>
        <div v-else-if="notification.status === Status.Success" class="px-1 text-green-500">
            <i class="far fa-check-circle" />
        </div>
        <div v-else class="px-1 text-gray-500">
            <i class="fas fa-info-circle" />
        </div>
        <div class="ml-2 mr-6 w-full overflow-hidden overflow-ellipsis">
            <span class="font-semibold w-full">{{ notification.title }}</span>
            <span class="text-gray-500 w-full block">{{ notification.text }}</span>
            <div class="pt-1 w-full flex items-center">
                <div class="flex items-center justify-between mr-2">
                    <span
                        :class="{
                            'text-green-500': notification.status === Status.Success,
                            'text-red-500': notification.status === Status.Error,
                            'text-blue-500': notification.status === Status.Info,
                        }"
                        class="text-xs font-semibold inline-block"
                    >
                        {{ getProgress }}
                    </span>
                </div>
                <div
                    :class="{
                        'bg-green-200': notification.status === Status.Success,
                        'bg-red-200': notification.status === Status.Error,
                        'bg-blue-200': notification.status === Status.Info,
                    }"
                    class="overflow-hidden h-2 text-xs flex rounded flex-1"
                >
                    <div
                        :class="{
                            'bg-green-500': notification.status === Status.Success,
                            'bg-red-500': notification.status === Status.Error,
                            'bg-blue-500': notification.status === Status.Info,
                        }"
                        :style="{ width: getPercentage + '%' }"
                        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed } from 'vue';
    import { ProgressNotification, Status } from '@/types/notifications';

    interface IProps {
        notification: ProgressNotification;
    }

    const props = defineProps<IProps>();
    const progress = {
        value: props.notification.progress,
    };
    const getPercentage = computed(() => {
        if (props.notification.max === 1) return ~~(progress.value * 100);

        return Math.floor((progress.value / props.notification.max) * 100);
    });

    const getProgress = computed(() => {
        if (props.notification.max === 1) return `${~~(progress.value * 100)}%`;

        return `${progress.value}/${props.notification.max}`;
    });
</script>

<style scoped></style>
