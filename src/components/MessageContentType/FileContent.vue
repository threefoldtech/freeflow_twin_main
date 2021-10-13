<template>
    <a
        :download="message.body.filename"
        :href="calcExternalResourceLink(message.body.url)"
        class="px-4 my-2 my-message:bg-accent-200"
    >
        <div
            class="
                icon
                bg-gray-600
                rounded-full
                h-12
                w-12
                flex
                items-center
                justify-center
                text-white
                my-message:bg-icon
            "
        >
            <i class="fas fa-file"></i>
        </div>
        <div class="pt-2 my-message:text-icon text-base">
            {{ message.body.filename }}
        </div>
    </a>
</template>

<script lang="ts" setup>
    import { calcExternalResourceLink } from '@/services/urlService';

    interface IProp {
        message: Object;
    }

    const props = defineProps<IProp>();
</script>
