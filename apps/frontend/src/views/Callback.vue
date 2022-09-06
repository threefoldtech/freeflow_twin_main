<template>
    <div>
        <h2>Redirecting you to your digitaltwin.</h2>
    </div>
</template>

<script lang="ts" setup>
    import { useRoute, useRouter } from 'vue-router';
    import { getMe, useAuthState } from '@/store/authStore';

    const { user } = useAuthState();

    const route = useRoute();
    const router = useRouter();

    const init = async () => {
        const profile = await getMe();

        if (!profile.email || !profile.username) {
            await router.push('error');
        }

        user.id = profile.username;
        user.email = profile.email;
        user.image = `${window.location.origin}/api/v2/user/avatar`;
    };

    init();

    router.push('/dashboard');
</script>
