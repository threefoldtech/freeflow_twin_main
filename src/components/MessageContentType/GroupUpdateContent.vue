<template>
    <div v-if="message.body.type == 'REMOVEUSER'">
        {{ message.body.contact.id }} has been removed from the group
    </div>
    <div v-if="message.body.type == 'ADDUSER'">
        {{ message.body.contact.id }} has been added to the group
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { calcExternalResourceLink } from '@/services/urlService';
import { useScrollActions, useScrollState } from '@/store/scrollStore';

export default defineComponent({
    name: 'ImageContent',
    props: {
        message: { type: Object, required: true },
    },
    setup(props) {
        const { addScrollEvent } = useScrollActions();

        const imageLoaded = () => {
            addScrollEvent();
        };
        return { imageLoaded, calcExternalResourceLink };
    },
});
</script>
