<template>
    {{ timeString }}
</template>

<script lang="ts">
    import { defineComponent, computed } from 'vue';
    import moment from 'moment';

    export default defineComponent({
        name: 'TimeContent',
        props: {
            time: { type: Date },
        },
        setup(props) {
            const timeString = computed(() => {
                return moment(props.time).fromNow();
            });

            return {
                timeString
            };
        },
    });
</script>

<style scoped></style>