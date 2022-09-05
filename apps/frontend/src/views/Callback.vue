<template>
    <div>
        <h2>Redirecting you to your digitaltwin.</h2>
    </div>
</template>

<script lang="ts" setup>
    import { useRouter } from 'vue-router';
    import { getMyName, loginName } from '@/store/authStore';

    let name = window.location.host.split('.')[0];

    const user = {
        name,
        image: `${window.location.origin}/api/v2/user/avatar`,
        email: `${name.replace(/ /g, '')}@domain.com`,
    };

    const init = async () => {
        loginName.value = await getMyName();
    };

    localStorage.setItem('user', JSON.stringify(user));

    init();

    const router = useRouter();
    router.push('/dashboard');
</script>
