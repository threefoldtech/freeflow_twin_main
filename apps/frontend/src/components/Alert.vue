<template>
    <TransitionRoot as="template" :show="showAlert">
        <Dialog as="div" class="fixed z-50 inset-0 overflow-y-auto" @close="close">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </TransitionChild>

                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <TransitionChild
                    as="template"
                    enter="ease-out duration-300"
                    enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enter-to="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leave-from="opacity-100 translate-y-0 sm:scale-100"
                    leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <div
                        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    >
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div
                                    :class="{
                                        'bg-red-100': type === 'warning',
                                        'bg-green-100': type === 'success',
                                        'bg-blue-100': type === 'info',
                                    }"
                                    class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"
                                >
                                    <information-circle-icon
                                        v-if="type === 'info'"
                                        class="h-6 w-6 text-blue-600"
                                        aria-hidden="true"
                                    />
                                    <check-circle-icon
                                        v-else-if="type === 'success'"
                                        class="h-6 w-6 text-green-600"
                                        aria-hidden="true"
                                    />
                                    <exclamation-icon v-else class="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                                        <slot name="title" />
                                    </DialogTitle>
                                    <div class="text-sm text-gray-500">
                                        <slot name="content" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col text-center sm:flex-row-reverse">
                            <slot name="actions" />
                        </div>
                    </div>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script lang="ts" setup>
    import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
    import { ExclamationIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/vue/outline';

    interface IProps {
        showAlert: boolean;
        type?: string;
    }

    const { showAlert, type } = withDefaults(defineProps<IProps>(), {
        showAlert: false,
        type: 'warning',
    });

    const emit = defineEmits(['close']);
    const close = () => {
        emit('close');
    };
</script>

<style scoped></style>
