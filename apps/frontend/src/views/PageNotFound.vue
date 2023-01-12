<template>
    <div class="flex flex-col h-full justify-center items-center">
        <img class="w-auto h-48" src="../assets/404.svg" alt="404 image" />
        <h1 class="p-5 text-6xl">PAGE NOT FOUND</h1>
        <button @click="changePage('whisper')" class="bg-primary object-contain font-bold text-white w-auto h-auto">
            <i class="fas fa-backward"></i> Return to chats
        </button>
    </div>
</template>
<script setup lang="ts">
    import { useRouter } from 'vue-router';

    const router = useRouter();

    const changePage = (page: any) => {
        router.push({ name: page });
    };
</script>
