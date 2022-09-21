<template>
    <div>
        <header>
            <div>
                <img src="" alt="cover photo" />
            </div>
            <div>
                <AvatarImg :id="user.id" class="w-12 h-12" />
                <h2>{{ user.name }}</h2>
                <button>Edit profile</button>
            </div>
        </header>
        <aside>
            <!--    about me    -->
            <!--     contact list     -->
        </aside>
        <main>
            <!--    create post (if own profile)      -->
            <!--    posts    -->
        </main>
    </div>
</template>

<script setup lang="ts">
    import { useAuthState } from '@/store/authStore';
    import AvatarImg from '@/components/AvatarImg.vue';

    const { user } = useAuthState();
</script>

<style scoped></style>
