<template>
    <div class="bg-white min-h-screen flex flex-col lg:relative">
        <div class="flex-grow flex flex-col">
            <main class="flex-grow flex flex-col bg-white">
                <div class="flex-grow mx-auto max-w-7xl w-full flex flex-col px-4 sm:px-6 lg:px-8">
                    <div class="flex-shrink-0 pt-10 sm:pt-16">
                        <a href="/" class="inline-flex">
                            <span class="sr-only">Workflow</span>
                            <img class="h-20 w-auto" alt="Threefold logo" src="/Logo_secundary.png" />
                        </a>
                    </div>
                    <div class="flex-shrink-0 my-auto py-16 sm:py-32">
                        <p class="text-md font-semibold text-indigo-600 uppercase tracking-wide">Welcome</p>
                        <h1 class="mt-2 text-2xl font-extrabold text-gray-900 tracking-tight sm:text-6xl">
                            {{ name }}
                        </h1>
                        <p class="mt-4 text-base text-gray-500">Automatically redirecting you in 5 seconds ...</p>
                        <div class="mt-6">
                            <a
                                href="#"
                                class="text-base font-medium text-indigo-600 hover:text-indigo-500"
                                @click="loginAndPush"
                                >Verify my identity now<span aria-hidden="true"> &rarr;</span></a
                            >
                        </div>
                    </div>
                </div>
            </main>
            <footer class="flex-shrink-0 bg-gray-50">
                <div class="mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
                    <nav class="flex space-x-4">
                        <span class="inline-block border-l border-gray-300" aria-hidden="true" />
                        <a
                            href="https://wiki.uhuru.me/"
                            target="_blank"
                            class="text-sm font-medium text-gray-500 hover:text-gray-600"
                            >Uhuru Wiki</a
                        >
                        <span class="inline-block border-l border-gray-300" aria-hidden="true" />
                    </nav>
                </div>
            </footer>
        </div>
        <div class="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img
                class="absolute inset-0 h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1577760258779-e787a1733016?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt=""
            />
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

    setTimeout(() => {
        loginAndPush();
    }, 5200);
</script>

<style scoped type="text/css"></style>
