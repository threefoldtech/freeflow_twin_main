<template>
    <GifSelector v-if="showGif" v-on:sendgif="sendGif" style="z-index: 10000" v-on:close="hideGif" />
    <div v-if="action" class="flex justify-between m-2 p-4 bg-white rounded-xl">
        <div class="flex flex-row">
            <div class="text-accent-300 mr-4 self-center">
                <i class="fa fa-reply fa-2x" v-if="action?.type === MessageAction.REPLY"></i>
                <i class="fa fa-pen fa-2x" v-else-if="action?.type === MessageAction.EDIT"></i>
            </div>
            <div class="max-w-[750px] break-all">
                <b>{{ action.message.from }}</b>
                <p>{{ getActionMessage }}</p>
            </div>
        </div>

        <button @click="clearAction">
            <i class="fas fa-times"></i>
        </button>
    </div>
    <div class="md:p-2 md:m-2 md:rounded-3xl bg-white flex flex-col min-h-[3em] md:flex-row" @paste="onPaste">
        <div class="md:col-span-4 flex flex-nowrap md:bg-transparent bg-gray-200" :class="{ hidden: !collapsed }">
            <button class="hover:text-icon mx-2 my-0 p-0 self-center flex-1 pt-0.5" @click="toggleGif">
                <h2>GIF</h2>
            </button>
            <button class="hover:text-icon mx-2 my-0 p-0 self-center flex-1" @click.stop="selectFile">
                <i class="fas fa-paperclip transform" style="--tw-rotate: -225deg"></i>
            </button>
            <input class="hidden" type="file" id="fileinput" ref="fileinput" @change="changeFile" />
            <button
                class="hover:text-icon mx-2 my-0 p-0 self-center flex-1"
                @click.stop="startRecording"
                v-if="!stopRecording"
            >
                <i class="fas fa-microphone"></i>
            </button>
            <button class="hover:text-icon mx-2 my-0 p-0 self-center flex-1" @click.stop="stopRecording" v-else>
                <i class="fas fa-circle text-red-600"></i>
            </button>

            <span
                ref="emojipicker"
                :class="{ hidden: !showEmoji }"
                style="position: absolute; bottom: 75px; z-index: 10000"
            >
                <unicode-emoji-picker v-pre></unicode-emoji-picker>
            </span>

            <button
                class="hover:text-icon mx-2 my-0 p-0 self-center flex-1"
                @click.stop="toggleEmoji"
                v-if="!attachment"
            >
                😃
            </button>
        </div>
        <div class="flex flex-row flex-1">
            <button
                class="hover:text-icon mx-2 my-0 p-0 self-center md:hidden"
                @click="collapsed = !collapsed"
                :key="collapsed.toString()"
            >
                <i v-if="collapsed" class="fas fa-chevron-down"></i>
                <i v-else class="fas fa-chevron-up"></i>
            </button>
            <div class="flex flex-col w-full">
                <div
                    class="bg-accent-100 inline-flex text-sm rounded flex-row h-8 pl-3 mt-1 mr-2 w-min"
                    v-if="attachment"
                >
                    <div class="self-center">
                        <i class="fas fa-file"></i>
                    </div>
                    <span class="ml-2 mr-1 leading-relaxed truncate max-w- self-center">
                        {{ attachment.name }}
                    </span>
                    <button class="hover:text-icon p-2 mx-0 self-center" @click.stop="removeFile">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class='flex'>
                    <form class="w-full flex-grow" @submit.prevent="chatsend">
                        <div class="mt-1 border-b border-gray-300 focus-within:border-primary">
                            <input
                                v-model="messageInput"
                                class="block w-full pl-1 border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 sm:text-sm"
                                autofocus
                                type="text"
                                ref="message"
                                placeholder="Write a message ..."
                            />
                        </div>
                    </form>

                    <button class="hover:text-icon mx-2 my-0 p-0 self-center" @click="chatsend">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div
        class="overlay-emoji"
        :class="{ hidden: !showEmoji }"
        @click="hideEmoji"
        style="position: fixed; width: 100vw; height: 100vh; background: transparent; top: 0; left: 0; z-index: 9999"
    ></div>
    <div
        class="overlay-gif"
        :class="{ hidden: !showGif }"
        @click="hideGif"
        style="position: fixed; width: 100vw; height: 100vh; background: transparent; top: 0; left: 0; z-index: 9999"
    ></div>
</template>