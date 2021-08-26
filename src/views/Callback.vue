<template>
    <div>
        <h2>Redirecting you to your digitaltwin.</h2>
    </div>
</template>

<script lang="ts" setup>
    import { useRouter } from 'vue-router';

    let name = window.location.host.split('.')[0];

    const user = {
        name,
        image: `${window.location.origin}/api/user/avatar`,
        email: `${name.replace(/ /g, '')}@domain.com`,
    };

    localStorage.setItem('user', JSON.stringify(user));

    const router = useRouter();
    router.push('/whisper');
</script>
