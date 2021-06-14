<template>
    <jdialog v-model="showUserConfigDialog" @update-model-value="closeDialog" noActions>
        <template v-slot:title>
            <h1>Profile settings</h1>
        </template>
        <div>
            <div class="avatar-container mb-2">
                <div class="flex">
                    <div
                        class="avatar-container mr-2 flex justify-center items-center cursor-pointer"
                        @mouseover="isHoveringAvatar = true"
                        @mouseleave="isHoveringAvatar = false"
                    >
                        <div
                            class="overlay flex justify-center items-center"
                            :class="isHoveringAvatar ? 'block' : 'hidden'"
                            @click="selectFile"
                        >
                            <i class="fas fa-pen text-white"></i>
                        </div>
                        <AvatarImg :id="user.id" large/>
                    </div>
                    <h1 class="text-center my-4">{{ user.id }}</h1>
                </div>
            </div>

            <div class="relative w-full h-full">
                    <button
                        v-if="!isEditingStatus"
                        class="absolute top-0 mt-2 right-0 flex flex-row text-white font-bold bg-green-400 border-2 border-green-400 hover:text-green-400 hover:bg-white rounded-md cursor-pointer items-center"
                        @click="setEditStatus(true)"
                    >
                        <i class="fas fa-pen fa-xs mr-1 align-middle"></i>
                        <p class="text-xs">Edit</p>
                    </button>



                    <button
                        v-if="isEditingStatus"
                        class="absolute top-1 mt-2 right-0 flex flex-row ml-1 text-white font-bold bg-green-400 border-2 border-green-400 hover:text-green-400 hover:bg-white rounded-md cursor-pointer items-center"
                        @click="sendNewStatus"
                    >
                        <i class="fas fa-check fa-xs mr-1 align-middle"></i>
                        <p class="text-xs">Save</p>

                    </button>


                <suspense>
                    <textarea
                        ref="statusInput"
                        v-model="userStatus"
                        style="resize: none"
                        class="w-full"
                        :disabled="!isEditingStatus"
                        :placeholder="myStatus"
                        maxlength="150"
                    >

                    </textarea>
                </suspense>
              <div v-if="isEditingStatus" class="flex justify-end">
                <span id="current">{{ userStatus.length }}</span>
                <span id="maximum">&nbsp;/&nbsp;150</span>

              </div>
            </div>
            <input
                class="hidden"
                type="file"
                id="fileInput"
                ref="fileInput"
                accept="image/*"
                @change="changeFile"
            />

            <div>
                <h2>{{ blockedUsers.length > 0 ? "Blocked": "No blocked users" }}</h2>
                <ul v-if="blockedUsers.length > 0" class="max-h-28 overflow-y-auto">
                    <template
                        v-for="blockedUser in blockedUsers"
                        :key="blockedUser"
                    >
                        <li>
                            {{ blockedUser }}
                            <button
                                class="px-4 py-2 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:border-blue-700 active:bg-blue-700 ease-in-out duration-150 cursor-pointer uppercase"
                                @click="unblockUser(blockedUser)"
                            >
                                unblock
                            </button>
                        </li>
                    </template>

                    <!-- <li v-if="blockedUsers.length === 0 && blockedUsersLoading">
                        ...
                    </li>
                    <li
                        v-if="blockedUsers.length === 0 && !blockedUsersLoading"
                    >
                        No blocked users
                    </li> -->
                </ul>
            </div>
        </div>
        <jdialog v-model="showEditAvatar"   noActions>
            <template v-slot:title>
                <h1>Avatar</h1>
            </template>
            <div class="flex w-full flex-col" >
                <div class="w-full" >
                    <vue-cropper

                        ref="cropper"
                        :aspect-ratio="1"
                        :src="src"
                        :viewMode="2"
                        :zoomable="false"
                        :guides="false"
                        :minCanvasWidth="64"
                        :minCropBoxWidth="64"
                        :containerStyle='{"max-height": "400px"}'
                        :background='false'
                    />
                </div>
                <div class="flex flex-row justify-end">
                    <Button @click="saveNewAvatar">
                        SAVE
                    </Button>
                    <Button @click="cancelNewAvatar">
                        CANCEL
                    </Button>
                </div>
            </div>
        </jdialog>
    </jdialog>
</template>

<script lang="ts">
    import {
        computed,
        defineComponent,
        onBeforeMount,
        onMounted,
        ref, watch,
        watchEffect,
    } from 'vue';
    import { useAuthState, getMyStatus } from '../store/authStore';
    import { useSocketActions } from '../store/socketStore';
    import Dialog from '@/components/Dialog.vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import {
        blocklist,
        deleteBlockedEntry,
        initBlocklist,
    } from '@/store/blockStore';
    import { setNewAvatar } from '@/store/userStore';
    import { fetchStatus } from '@/store/statusStore';
    import { useRoute, useRouter } from 'vue-router';
    import { showAddUserDialog, showUserConfigDialog } from '@/services/dialogService';
    import { statusList } from '@/store/statusStore';
    import { calcExternalResourceLink } from '../services/urlService';
    import VueCropper from 'vue-cropperjs';
    import 'cropperjs/dist/cropper.css';
    import Button from '@/components/Button.vue';

    export default defineComponent({
        name: 'UserConfigDialog',
        components: { AvatarImg, jdialog: Dialog, VueCropper, Button },
        emits: ['addUser'],
        created: () => {
            initBlocklist();


        },
        async setup({}, ctx) {
            const { user } = useAuthState();
            const showEditPic = ref(false);
            const fileInput = ref();
            const file = ref();
            const userStatus = ref('');
            const isEditingStatus = ref(false);
            const router = useRouter();
            const route = useRoute();
            const myStatus = await getMyStatus();
            const cropper = ref(null);
            const isHoveringAvatar = ref(false);
            const showEditAvatar = ref(false);


            watch(showEditAvatar, () => {
                if (showEditAvatar.value){
                    window.addEventListener("keypress", enterPressed)
                    return
                }
                window.removeEventListener("keypress", enterPressed)
            });
            watchEffect(() => {
                if(!cropper.value) {
                    return;
                }
                if(!file.value) {
                    cropper.value.destroy();
                    return;
                }
                const reader = new FileReader();
                reader.onload = event => {
                    cropper.value.replace(event.target.result);
                };
                reader.readAsDataURL(file.value);
            });
            const enterPressed = (e) => {
                if (e.key === "Enter"){
                    saveNewAvatar()
                }
            }
            const backOrMenu = () => {
                if (route.meta && route.meta.back) {
                    router.push({ name: <any>route.meta.back });
                    return;
                }
                showUserConfigDialog.value = true;
            };

            const selectFile = () => {
                fileInput.value.click();
            };

            const changeFile = () => {
                const newFile = fileInput.value?.files[0];
                if (!newFile || newFile.type.indexOf('image/') === -1) {
                    return;
                }

                file.value = fileInput.value?.files[0];
                showEditAvatar.value = true;
                fileInput.value.value = null;
            };

            const saveNewAvatar = async () => {
                const blob = await (
                    await fetch(
                        cropper.value
                            .getCroppedCanvas()
                            .toDataURL(file.value.type)
                    )
                ).blob();
                const tempFile = new File([blob], 'avatar', {
                    type: file.value.type,
                });
                await sendNewAvatar(tempFile);
                showEditAvatar.value = false;
            };

            const cancelNewAvatar = () => {
                showEditAvatar.value = false;
            };

            const removeFile = () => {
                file.value = null;
            };

            const closeDialog = newVal => {
                showUserConfigDialog.value = newVal;
            }

            const sendNewAvatar = async (data: any) => {
                await setNewAvatar(data);
                await fetchStatus(user.id);
            };

            const setEditStatus = (edit: boolean) => {
                isEditingStatus.value = edit;
                userStatus.value = user.status;
            };
            const sendNewStatus = async () => {
                const { sendSocketUserStatus } = useSocketActions();
                sendSocketUserStatus(userStatus.value);
                user.status = userStatus.value;
                isEditingStatus.value = false;
            };

            const unblockUser = async user => {
                await deleteBlockedEntry(user);
                showUserConfigDialog.value = false;
            };

            const addUser = () => {
                ctx.emit('addUser');
            };
            const status = computed(() => {
                return statusList[<string>user.id];
            });

            const src = computed(() => {
                if (!status.value || !status.value.avatar) {
                    return `https://avatars.dicebear.com/4.5/api/jdenticon/${encodeURI(
                        <string>user.id
                    )}.svg?m=14&b=%23ffffff`;
                }

                return calcExternalResourceLink(status.value.avatar);
            });

            return {
                addUser,
                backOrMenu,
                user,
                showEditPic,
                fileInput,
                file,
                selectFile,
                changeFile,
                removeFile,
                sendNewAvatar,
                sendNewStatus,
                userStatus,
                setEditStatus,
                isEditingStatus,
                blockedUsers: blocklist,
                unblockUser,
                route,
                showUserConfigDialog,
                src,
                myStatus,
                cropper,
                saveNewAvatar,
                isHoveringAvatar,
                showEditAvatar,
                cancelNewAvatar,
                closeDialog,

            };
        },
    });
</script>

<style scoped>
    .configDialog {
        position: absolute;
        margin: auto;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 800px;
        height: 600px;
        z-index: 10;
        background-color: aquamarine;
        border: 2px solid black;
    }
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
