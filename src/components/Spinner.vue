<template>
    <div
        class="loader ease-linear rounded-full border-4 border-gray-200 h-8 w-8 inline-block"
        :class='{
            "h-12 w-12 border-4": xlarge,
            "h-10 w-10": large,
            "h-6 w-6": small,
            "h-4 w-4 border-2":xsmall
        }'
    >

    </div>
</template>

<script>
    export default {
        name: 'Spinner',
        props: {
            xlarge: { required: false, default: false, type: Boolean },
            large: { required: false, default: false, type: Boolean },
            small: { required: false, default: false, type: Boolean },
            xsmall: { required: false, default: false, type: Boolean },
        }
    };
</script>

<style scoped>
    .loader {
        border-top-color: rgb(78, 196, 143) !important;
        -webkit-animation: 1.5s spinner linear infinite;
        animation: 1.5s spinner linear infinite;
    }
</style>
