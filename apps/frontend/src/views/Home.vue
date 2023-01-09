<template>
    <div class="bg-white min-h-screen flex flex-col lg:relative">
        <div class="flex-grow flex flex-col">
            <main class="flex-grow flex flex-col bg-white">
                <div class="flex-grow mx-auto max-w-7xl w-full flex flex-col px-4 sm:px-6 lg:px-8">
                    <div class="flex-shrink-0 my-auto py-16 sm:py-32">
                        <p class="text-md font-semibold text-indigo-600 uppercase tracking-wide">Welcome</p>
                        <h1 class="mt-2 text-2xl font-extrabold text-gray-900 tracking-tight sm:text-6xl">
                            {{ name }}
                        </h1>
                        <p class="mt-4 text-base text-gray-500">Automatically redirecting you in 5 seconds ...</p>
                    </div>
                </div>
            </main>
        </div>
        <div class="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img class="absolute inset-0 h-full w-full object-cover" src="/freeflow_home.png" alt="FreeFlow homepage" />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { login } from '@/services/authService';

    const loginAndPush = async () => {
        console.log('Attempting to login ...');
        await login();
    };

    const name = window.location.host.split('.')[0];

    setTimeout(() => loginAndPush(), 5200);
</script>

<style scoped type="text/css"></style>
