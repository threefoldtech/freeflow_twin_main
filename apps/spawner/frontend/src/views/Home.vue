<template>
    <div
        style="display: flex; flex-direction: column; justify-content: justify-around; align-items: center"
        class="overflow-hidden"
    >
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center">
            <img class="h-28" src="@/assets/uhuru_spawner.svg" alt="uhuru logo" />
        </div>
        <div style="background-color: white; padding: 50px" class="mt-5 rounded-md shadow">
            <div class="flex flex-col">
                <h1>Start your Uhuru journey</h1>
                <p>Please enter your <strong>ThreeFold Connect</strong> name</p>
                <input
                    v-model="name"
                    type="text"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mt-7"
                    pattern="[0-9a-zA-Z\.]"
                    placeholder="Username"
                    @keyup.enter="loginAndSpawn"
                />

                <button class="py-2 px-4 mt-2 text-white rounded-md bg-primary" @click="loginAndSpawn">GO!</button>
            </div>
        </div>
        <div class="mt-5 h-72 flex flex-col items-center">
            <Disclosure v-slot="{ open }">
                <DisclosureButton class="flex justify-between items-center">
                    <span class="">Do you want to run the decentralized Uhuru machine on your own machine?</span>
                    <ChevronUpIcon :class="{ 'rotate-180': !open }" class="w-5 h-5 text-gray-500 transform mx-2" />
                </DisclosureButton>
                <DisclosurePanel style="width: 28rem" class="px-4 pt-4 pb-2 text-sm text-gray-500">
                    <div class="flex flex-col items-center">
                        <p class="text-left max-w-md self-start">1. Install Docker</p>
                        <Disclosure v-slot="{ open }">
                            <DisclosureButton class="flex justify-between items-center self-start">
                                <p>2. Run your own Uhuru environment inside a Docker</p>
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
                                        "ENVIRONMENT=staging" --cap-add=NET_ADMIN --device=/dev/net/tun:/dev/net/tun -p
                                        443:443 threefoldjimber/digitaltwin:latest
                                        <span class="text-black">/////</span>
                                    </p>
                                </div>
                            </DisclosurePanel>
                        </Disclosure>
                        <p class="text-left max-w-md mt-2 self-start">
                            3. Browse to https://{{ username }}.digitaltwin-local.jimbertesting.be<br />
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
</template>

<script lang="ts">
    import { defineComponent, ref } from 'vue';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { spawn } from '@/service/spawnService';
    import { ChevronUpIcon } from '@heroicons/vue/solid';
    export default defineComponent({
        components: {
            Disclosure,
            DisclosureButton,
            DisclosurePanel,
            ChevronUpIcon,
        },
        setup() {
            const name = ref('');
            const loginAndSpawn = () => {
                const actualName = name.value.toLowerCase().trim().split('.3bot')[0];
                console.log('Username', actualName);
                console.log('Going to login with username: ', actualName);
                spawn(actualName);
            };

            return {
                name,
                loginAndSpawn,
            };
        },
    });
</script>

<style type="text/css"></style>
