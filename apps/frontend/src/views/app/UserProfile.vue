<template>
    <AppLayout>
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
            <div v-if="isLoadingSocialPosts" class="fixed right-5 bottom-5 flex items-center">
                <p class="mr-4">Loading</p>
                <Spinner />
            </div>
            <Post :item="item" v-for="item in allSocialPosts" :key="item.post.id" />
            <!--    posts    -->
        </main>
    </AppLayout>
</template>

<script setup lang="ts">
    import { useAuthState } from '@/store/authStore';
    import AppLayout from '@/layout/AppLayout.vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { getAllPosts } from '@/services/socialService';
    import Post from '@/components/Dashboard/Post.vue';
    import { allSocialPosts, isLoadingSocialPosts } from '@/store/socialStore';
    import Spinner from '@/components/Spinner.vue';
    import { ref } from 'vue';
    import { Contact } from '@/types';
    import { useContactsActions } from '@/store/contactStore';
    import { useRoute } from 'vue-router';
    import { statusList } from '@/store/statusStore';

    const { user } = useAuthState();
    const { retrieveContacts } = useContactsActions();

    const contacts = ref<Contact[]>([]);

    const contact = ref<Contact>();
    const route = useRoute();

    (async () => {
        contacts.value = await retrieveContacts();
        if (user.id !== route.params.id) {
            contact.value = contacts.value.find(c => c.id === route.params.id);
        }
        const userId = contact.value ? contact.value.id : user.id;
        await getAllPosts(userId.toString());
    })();
</script>

<style scoped></style>
