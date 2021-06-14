import { Chat, MessageTypes } from '@/types';
import moment from 'moment';
import { ref } from 'vue';

export const messageBox = ref(null);
export const scrollMessageBoxToBottom = () => {
    messageBox?.value?.scrollTo(0, messageBox.value.scrollHeight);
}

export const isLastMessage = (chat: Chat, index: number) => {
    if (index + 1 === chat.messages.length) {
        return true;
    }
    const currentMessage = chat.messages[index];
    const nextMessage = chat.messages[index + 1];

    if (nextMessage.type === MessageTypes.SYSTEM) return true;
    if (showDivider(chat, index + 1)) return true;

    return currentMessage.from !== nextMessage.from;
};
export const isFirstMessage = (chat: Chat, index: number) => {
    if (index === 0) {
        return true;
    }
    const currentMessage = chat.messages[index];
    const prevMessage = chat.messages[index - 1];

    if (prevMessage.type === MessageTypes.SYSTEM) return true;
    if (showDivider(chat, index)) return true;

    return currentMessage.from !== prevMessage.from;
};
export const showDivider = (chat: Chat, index) => {
    const currentMessage = chat.messages[index];
    const previousMessage = chat.messages[index - 1];
    if (!previousMessage) {
        return true;
    }
    const time = moment(currentMessage.timeStamp);

    return time.diff(previousMessage.timeStamp, 'm') > 5;
};
