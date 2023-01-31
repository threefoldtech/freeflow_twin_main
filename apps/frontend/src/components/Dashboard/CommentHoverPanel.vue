<template>
    <div class="mt-4 bg-white px-4 py-4 w-72 shadow rounded cursor-default z-50">
        <div class="flex space-x-3">
            <div class="flex flex-shrink-0">
                <img :src="avatar" alt="" class="h-16 w-16 object-fill rounded-full" />
            </div>
            <div class="flex flex-col space-y-2">
                <div class="font-semibold text-base text-black">
                    <a class="hover:underline" href="#">
                        {{ comment.owner.id }}
                    </a>
                </div>

                <div class="flex justify-start items-center space-x-2">
                    <div class="w-auto text-sm leading-none" v-if="friendsSince">
                        <small>
                            Friends since <span class="font-medium">{{ friendsSince }}</span>
                        </small>
                    </div>
                </div>
                <div class="flex justify-start items-center space-x-2">
                    <div class="w-auto text-sm leading-none">
                        <small>
                            <span
                                class="font-semibold text-sm"
                                :class="{
                                    'text-green-600': online,
                                    'text-red-600': !online,
                                }"
                                >{{ online ? 'Online' : 'Offline' }}</span
                            >
                        </small>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex space-x-3 mt-4">
            <div class="w-auto" v-if="isPersonFriend !== null">
                <a
                    class="text-xs text-accent-600 hover:bg-opacity-60 font-semibold flex items-center justify-center px-3 py-2 bg-accent-300 bg-opacity-50 rounded-lg"
                    href="#"
                    @click="goToChat"
                >
                    <div class="mr-1 h-6 flex items-center flex-shrink-0">
                        <img class="" src="/whisperbold.svg" alt="whisper" />
                    </div>
                    {{ isPersonFriend ? 'Whisper' : 'Add chat' }}
                </a>
            </div>
            <div class="w-auto">
                <a
                    class="text-xs text-gray-800 hover:bg-gray-300 font-semibold w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg"
                    href="#"
                    @click="goToKutana"
                >
                    <img class="w-6 h-6" src="/kutanabold.svg" alt="kutana" />
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useRouter } from 'vue-router';
    import { useContactsActions, useContactsState } from '@/store/contactStore';
    import { usechatsActions } from '@/store/chatStore';
    import { myYggdrasilAddress } from '@/store/authStore';
    import { computed, nextTick, onBeforeMount, ref } from 'vue';
    import { fetchStatus } from '@/store/statusStore';
    import { IPostContainerDTO } from 'custom-types/post.type';

    const { addContact, retrieveContacts } = useContactsActions();
    const { getChat } = usechatsActions();

    const props = defineProps<{
        comment: IPostContainerDTO;
        avatar: string;
    }>();
    const friendsSince = ref<string>();
    const online = ref<boolean>();
    const router = useRouter();
    const userLocation = ref('');

    onBeforeMount(async () => {
        await retrieveContacts();
        userLocation.value = await myYggdrasilAddress();
        const userId = props.comment.owner.id;
        const { isOnline } = await fetchStatus(userId);
        online.value = isOnline;
        const chat = getChat(userId);
        if (chat && chat.createdAt) {
            const options = {
                year: '2-digit',
                month: 'long',
                day: 'numeric',
            };
            const formattedDate = new Date(chat.createdAt).toLocaleDateString('nl-BE', options);
            friendsSince.value = formattedDate;
        }
    });

    const isPersonFriend = computed(() => {
        if (userLocation.value === props.comment.owner.location) return null;
        return useContactsState().contacts.some(item => item.id === props.comment.owner.id);
    });

    const goToChat = async e => {
        e.preventDefault();
        if (userLocation.value === props.comment.owner.location) return;
        if (!useContactsState().contacts.some(item => item.id === props.comment.owner.id)) {
            await addContact(props.comment.owner.id, props.comment.owner.location);
        }
        await nextTick(async () => {
            localStorage.setItem('lastOpenedChat', props.comment.owner.id);
            await router.push({ name: 'whisper' });
        });
    };

    const goToKutana = async e => {
        e.preventDefault;
        await nextTick(async () => {
            await router.push({ name: 'kutana' });
        });
    };
</script>

<style scoped></style>
