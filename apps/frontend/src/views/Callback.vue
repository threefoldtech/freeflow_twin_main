<template>
    <div>
        <h2>Redirecting you to your digitaltwin.</h2>
    </div>
</template>

<script lang="ts" setup>
    import { useRoute, useRouter } from 'vue-router';
    import { useAuthState } from '@/store/authStore';

    const { user } = useAuthState();

    const route = useRoute();
    const router = useRouter();

    const init = async () => {
        const email = route.query.email;
        const username = route.query.username;

        if (!email || !username) {
            await router.push('error');
        }

        user.id = <string>username;
        user.email = <string>email;
        user.image = `${window.location.origin}/api/v2/user/avatar`;
    };

    init();

    router.push('/dashboard');
</script>
