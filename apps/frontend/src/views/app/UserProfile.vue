<template>
    <AppLayout>
        <div class="w-[80%] mx-auto mt-6">
            <header>
                <div>
                    <!--                <img src="" alt="cover photo" />-->
                    <div class="bg-gray-300 w-full h-60"></div>
                </div>
                <div class="-mt-20 px-5 flex flex-row justify-between items-center">
                    <AvatarImg
                        :id="route.params?.id"
                        :showOnlineStatus="false"
                        :xlarge="true"
                        class="w-48 h-48 border-white border-4 rounded-full"
                    />
                    <h2 class="bg-blue-100 ml-5 flex-1">{{ contact?.id ?? user.id }}</h2>
                    <button
                        class="text-gray-500 py-2 px-4 mr-2 rounded-md bg-gray-100 border-[1px] border-gray-400"
                        @click=""
                    >
                        <i class="fas fa-plus"></i> Edit profile
                    </button>
                </div>
            </header>
            <div>
                <p class="bg-primarylight">{{ statusList[contact?.id ?? user.id]?.status }}</p>
                <!--    about me    -->
                <!--     contact list     -->
            </div>
            <main>
                <!--    create post (if own profile)      -->
                <div v-if="isLoadingSocialPosts" class="fixed right-5 bottom-5 flex items-center">
                    <p class="mr-4">Loading</p>
                    <Spinner />
                </div>
                <Post :item="item" v-for="item in allSocialPosts" :key="item.post.id" />
                <!--    posts    -->
            </main>
        </div>
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
