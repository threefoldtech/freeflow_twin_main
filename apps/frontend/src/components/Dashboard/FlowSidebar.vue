<template>
    <div class="h-full w-full bg-red-300">
        <div>
            <ul class="font-semibold text-lg flex flex-col">
                <li class="p-4 bg-accent-800 text-white rounded-lg">
                    <HomeIcon class="text-white w-5 h-5" />Dashboard
                </li>
                <li><BellIcon class="text-white w-4 h-4" />Notifications</li>
                <li><UserGroupIcon class="text-white w-4 h-4" />Communities</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { BellIcon, HomeIcon, UserGroupIcon } from '@heroicons/vue/solid';
</script>

<style scoped></style>
