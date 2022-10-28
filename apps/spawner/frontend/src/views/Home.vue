<template>
    <div class="flex flex-col justify-around relative items-center min-h-screen">
        <div
            v-if="route.query.username"
            class="loader ease-linear rounded-full border-4 inline-block h-12 w-12 border-4"
        ></div>

        <div v-else>
            <div class="flex flex-row justify-center items-center mt-10 mb-5">
                <img class="h-16" src="@/assets/freeflow.svg" alt="FreeFlow logo" />
            </div>
            <div class="flex flex-row justify-center items-center">
                <img class="h-80" src="@/assets/freeflow_spawner.png" alt="FreeFlow spawner" />
            </div>

            <div class="flex flex-col">
                <h1 class="uppercase text-center">
                    Welcome to your<br /><span class="font-bold">freeflow experiences.</span>
                </h1>
                <p class="font-medium text-base">Please enter your ThreeFold Connect username in order to continue.</p>
                <input
                    v-model="name"
                    type="text"
                    class="py-2 uppercase text-center bg-[#e3dbd5] block w-full sm:text-base border-transparent text-gray-900 rounded-md mt-7"
                    pattern="[0-9a-zA-Z\.]"
                    placeholder="Username"
                    @keyup.enter="loginAndSpawn"
                />

                <button class="py-2 px-4 mt-2 text-white rounded-md bg-[#66c9bf]" @click="loginAndSpawn">GO!</button>
            </div>
            <div class="mt-5 h-72 flex flex-col items-center">
                <Disclosure v-slot="{ open }">
                    <DisclosureButton class="flex justify-between items-center">
                        <span class="">Do you want to run the decentralized FreeFlow machine on your own machine</span>
                        <ChevronUpIcon :class="{ 'rotate-180': !open }" class="w-5 h-5 text-gray-500 transform mx-2" />
                    </DisclosureButton>
                    <DisclosurePanel style="width: 28rem" class="px-4 pt-4 pb-2 text-sm text-gray-500">
                        <div class="flex flex-col items-center">
                            <p class="text-left max-w-md self-start">1. Install Docker</p>
                            <Disclosure v-slot="{ open }">
                                <DisclosureButton class="flex justify-between items-center self-start">
                                    <p>2. Run your own FreeFlow environment inside a Docker</p>
                                    <ChevronUpIcon
                                        :class="{ 'rotate-180': !open }"
                                        class="w-5 h-5 text-gray-500 transform mx-2"
                                    />
                                </DisclosureButton>
                                <DisclosurePanel class="max-w-md flex justify-center">
                                    <div
                                        class="bg-black text-white mt-2 p-4 h-16 overflow-x-scroll overflow-y-hidden whitespace-nowrap rounded-md"
                                    >
                                        <p class="text-white text-left">
                                            docker run -ti --sysctl net.ipv6.conf.all.disable_ipv6=0 -e "USER_ID={{
                                                USERNAME
                                            }}" -e "DIGITALTWIN_APPID=digitaltwin-local.jimbertesting.be" -e
                                            "ENVIRONMENT=staging" --cap-add=NET_ADMIN --device=/dev/net/tun:/dev/net/tun
                                            -p 443:443 threefoldjimber/digitaltwin:latest
                                            <span class="text-black">/////</span>
                                        </p>
                                    </div>
                                </DisclosurePanel>
                            </Disclosure>
                            <p class="text-left max-w-md mt-2 self-start">
                                3. Browse to https://{{ USERNAME }}.digitaltwin-local.jimbertesting.be<br />
                                4. Replace {{ USERNAME }} with your own name.
                            </p>
                        </div>
                    </DisclosurePanel>
                </Disclosure>
            </div>
            <div
                class="fixed left-0 top-0 bg-red-700 text-white uppercase text-xl z-[9999] px-16 transform -rotate-45 -translate-x-16 translate-y-2 opacity-50 pointer-events-none"
            >
                Beta
            </div>
            <p class="absolute bottom-2">
                Powered by
                <a class="underline color-primary" href="https://threefold.io/">ThreeFold</a>
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { spawn } from '@/service/spawnService';
    import { ChevronUpIcon } from '@heroicons/vue/solid';
    import { useRoute } from 'vue-router';

    const route = useRoute();
    const name = ref((route.query.username as string) ?? null);
    const USERNAME = '{{ USERNAME }}';

    const loginAndSpawn = () => {
        if (!name.value) return;

        const actualName = name.value.toLowerCase().trim().split('.3bot')[0];
        spawn(actualName);
    };

    if (name.value) loginAndSpawn();
</script>

<style type="text/css">
    .loader {
        border-top-color: rgb(46, 38, 111) !important;
        -webkit-animation: 1.5s spinner linear infinite;
        animation: 1.5s spinner linear infinite;
    }
</style>
