<template>
    <Dialog v-model="showUserConfigDialog" @update-model-value="closeDialog" :noActions="true">
        <template v-slot:title>
            <h1 class="font-medium">Profile settings</h1>
        </template>
        <div>
            <div class="avatar-container mb-2 px-4">
                <div class="flex gap-2 items-center">
                    <div
                        class="avatar-container mr-2 flex justify-center items-center cursor-pointer"
                        @mouseover="isHoveringAvatar = true"
                        @mouseleave="isHoveringAvatar = false"
                    >
                        <div
                            class="overlay flex justify-center items-center peer"
                            :class="isHoveringAvatar ? 'block' : 'hidden'"
                            @click="selectFile"
                        >
                            <i class="fas fa-pen text-icon"></i>
                        </div>
                        <AvatarImg
                            :id="user.id"
                            large
                            class="ring-icon ring-offset-1 peer-hover:ring-1 overflow-hidden"
                        />
                    </div>
                    <h1 class="text-center my-4">{{ user.id }}</h1>
                </div>
            </div>

            <div class="relative w-full h-full px-4">
                <button
                    v-if="!isEditingStatus"
                    class="absolute top-0 mt-2 mr-6 right-0 px-2 py-1 flex flex-row text-white font-bold bg-primary border-2 border-primary hover:text-primary hover:bg-white rounded-md cursor-pointer items-center"
                    @click="setEditStatus(true)"
                >
                    <i class="fas fa-pen fa-xs mr-1 align-middle"></i>
                    <p class="text-xs">Edit</p>
                </button>

                <button
                    v-if="isEditingStatus"
                    class="absolute top-1 mt-2 mr-6 right-0 px-2 py-1 flex flex-row ml-1 text-white font-bold bg-primary border-2 border-primary hover:text-primary hover:bg-white rounded-md cursor-pointer items-center"
                    @click="sendNewStatus"
                >
                    <i class="fas fa-check fa-xs mr-1 align-middle"></i>
                    <p class="text-xs">Save</p>
                </button>

                <suspense>
                    <div @click="!isEditingStatus ? setEditStatus(true) : null">
                        <textarea
                            v-model="userStatus"
                            style="resize: none"
                            class="w-full autoexpand tracking-wide py-2 px-4 mb-3 leading-relaxed appearance-none block w-full bg-gray-200 border border-gray-200 rounded focus:outline-none focus:bg-white focus:border-gray-500"
                            :disabled="!isEditingStatus"
                            :placeholder="statusList[user.id]?.status ?? 'No status set'"
                            maxlength="150"
                        >
                        </textarea>
                    </div>
                </suspense>
                <div v-if="isEditingStatus" class="flex justify-end">
                    <span id="current">{{ userStatus?.length }}</span>
                    <span id="maximum">&nbsp;/&nbsp;150</span>
                </div>
            </div>
            <input class="hidden" type="file" id="fileInput" ref="fileInput" accept="image/*" @change="changeFile" />

            <div class="px-4">
                <h2>{{ blocklist?.length > 0 ? 'Blocked' : 'No blocked users' }}</h2>
                <ul v-if="blocklist?.length > 0" class="max-h-28 overflow-y-auto">
                    <template v-for="blockedUser in blocklist" :key="blockedUser">
                        <li class="flex flex-row justify-between items-center mt-2 pb-2 border-b">
                            <span>{{ blockedUser }}</span>
                            <button
                                class="px-4 py-2 text-base font-medium rounded-md text-white bg-primary hover:bg-primary focus:border-primary active:bg-primary ease-in-out duration-150 cursor-pointer uppercase"
                                @click="unblockUser(blockedUser)"
                            >
                                unblock
                            </button>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
        <Dialog v-model="showEditAvatar" @update-model-value="cancelNewAvatar" :noActions="true">
            <template v-slot:title>
                <h1 class="font-medium">Avatar</h1>
            </template>
            <div class="flex w-full flex-col">
                <div class="w-full">
                    <vue-cropper
                        ref="cropper"
                        :aspect-ratio="1"
                        :src="src"
                        :viewMode="2"
                        :zoomable="false"
                        :guides="false"
                        :minCanvasWidth="64"
                        :minCropBoxWidth="64"
                        :containerStyle="{ 'max-height': '400px' }"
                        :background="false"
                    />
                </div>
                <div class="flex flex-row justify-end mt-2 px-4">
                    <button
                        @click="cancelNewAvatar"
                        class="rounded-md border border-gray-400 mr-2 px-4 py-2 justify-self-end"
                    >
                        Cancel
                    </button>
                    <button @click="saveNewAvatar" class="text-white py-2 px-4 rounded-md bg-primary">
                        Save image
                    </button>
                </div>
            </div>
        </Dialog>
    </Dialog>
</template>

<script setup lang="ts">
    import { computed, ref, watch, watchEffect } from 'vue';
    import { useAuthState } from '@/store/authStore';
    import { useSocketActions } from '@/store/socketStore';
    import Dialog from '@/components/Dialog.vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { blocklist } from '@/store/blockStore';
    import { setNewAvatar } from '@/store/userStore';
    import { fetchStatus } from '@/store/statusStore';
    import { useRoute, useRouter } from 'vue-router';
    import { showUserConfigDialog } from '@/services/dialogService';
    import { statusList } from '@/store/statusStore';
    import { calcExternalResourceLink } from '@/services/urlService';
    import VueCropper from 'vue-cropperjs';
    import 'cropperjs/dist/cropper.css';
    import { FileAction } from 'custom-types/file-actions.type';

    const { user } = useAuthState();

    const emit = defineEmits(['addUser']);
    const router = useRouter();
    const route = useRoute();
    const isHoveringAvatar = ref(false);

    const enterPressed = e => {
        if (e.key === 'Enter') {
            saveNewAvatar();
        }
    };

    const fileInput = ref();

    const selectFile = () => {
        fileInput.value.click();
    };

    const file = ref();
    const showEditAvatar = ref(false);

    const changeFile = () => {
        const newFile = fileInput.value?.files[0];
        if (!newFile || newFile.type.indexOf('image/') === -1) {
            return;
        }

        file.value = fileInput.value?.files[0];
        showEditAvatar.value = true;
        fileInput.value.value = null;
    };

    const cropper = ref(null);

    const saveNewAvatar = async () => {
        const blob = await (await fetch(cropper.value?.getCroppedCanvas().toDataURL(file.value.type))).blob();
        const tempFile = new File([blob], 'avatar', {
            type: file.value.type,
        });
        await sendNewAvatar(tempFile);
        showEditAvatar.value = false;
    };

    const cancelNewAvatar = () => {
        showEditAvatar.value = false;
    };

    const closeDialog = (newVal: boolean) => {
        showUserConfigDialog.value = newVal;
    };

    const sendNewAvatar = async (data: any) => {
        const { sendHandleUploadedFile } = useSocketActions();
        const avatar = await setNewAvatar(data);
        await sendHandleUploadedFile({
            fileId: avatar.id,
            action: FileAction.CHANGE_AVATAR,
            payload: { filename: avatar.filename },
        });
        await fetchStatus(user.id, true);
    };

    const userStatus = ref('');
    const isEditingStatus = ref(false);

    const setEditStatus = (edit: boolean) => {
        isEditingStatus.value = edit;
        userStatus.value = user.status;
    };
    const sendNewStatus = async () => {
        const { sendSocketUserStatus } = useSocketActions();
        await sendSocketUserStatus(userStatus.value);
        user.status = userStatus.value;
        isEditingStatus.value = false;
    };

    const unblockUser = async (user: string) => {
        const { sendUnBlockedChat } = useSocketActions();
        sendUnBlockedChat(user);
        showUserConfigDialog.value = false;
    };

    const addUser = () => {
        emit('addUser');
    };

    const status = computed(() => {
        return statusList[<string>user.id];
    });

    const src = computed(() => {
        if (!status.value || !status.value.avatar) {
            return `https://avatars.dicebear.com/4.5/api/jdenticon/${encodeURI(<string>user.id)}.svg?m=14&b=%23ffffff`;
        }

        return calcExternalResourceLink(status.value.avatar);
    });

    watch(showEditAvatar, () => {
        if (showEditAvatar.value) {
            window.addEventListener('keypress', enterPressed);
            return;
        }
        window.removeEventListener('keypress', enterPressed);
    });

    watchEffect(() => {
        if (!cropper.value) return;

        if (!file.value) {
            cropper.value.destroy();
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            cropper.value.replace(event.target.result);
        };
        reader.readAsDataURL(file.value);
    });
</script>

<style scoped>
    .avatar-container {
        position: relative;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 20;
        text-align: center;
    }
</style>
