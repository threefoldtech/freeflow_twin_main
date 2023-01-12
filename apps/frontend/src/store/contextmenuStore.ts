import { ref } from 'vue';
import { Chat, Message } from '@/types';
import { PathInfoModel } from '@/store/fileBrowserStore';

/************
 *
 *  Actions
 *
 ************/

export enum RIGHT_CLICK_ACTIONS_FILE_BROWSER_ITEM {
    DELETE = 'DELETE',
    RENAME = 'RENAME',
    DOWNLOAD = 'DOWNLOAD',
    SHARE = 'SHARE',
}

export enum RIGHT_CLICK_ACTIONS_MESSAGE {
    REPLY = 'REPLY',
    EDIT = 'EDIT',
    DELETE = 'DELETE',
}

export enum RIGHT_CLICK_ACTIONS_CHAT_CARD {
    BLOCK = 'BLOCK',
    DELETE = 'DELETE',
    DELETE_USER = 'DELETE_USER',
    OPEN_CHAT = 'OPEN_CHAT',
}

export type RIGHT_CLICK_ACTIONS =
    | RIGHT_CLICK_ACTIONS_MESSAGE
    | RIGHT_CLICK_ACTIONS_CHAT_CARD
    | RIGHT_CLICK_ACTIONS_FILE_BROWSER_ITEM;

/**********
 *
 *  Types
 *
 **********/

export enum RIGHT_CLICK_TYPE {
    MESSAGE = 'MESSAGE',
    LOCAL_FILE = 'LOCAL_FILE',
    CHAT_CARD = 'CHAT_CARD',
}

/**********
 *
 *  State
 *
 **********/

export interface ICurrentRightClickItem<T> {
    type: RIGHT_CLICK_TYPE;
    data: T;
}

export const currentRightClickedItem = ref<ICurrentRightClickItem<Chat | Message<any> | PathInfoModel> | null>(null);
export const rightClickItemAction = ref<RIGHT_CLICK_ACTIONS | null>(null);
export const triggerWatchOnRightClickItem = ref<boolean>(false);
export const openBlockDialogFromOtherFile = ref<boolean>(false);
export const openDeleteDialogFromOtherFile = ref<boolean>(false);
export const openDeleteUserDialogFromOtherFile = ref<boolean>(false);

//This is so used to rerender a component
export const conversationComponentRerender = ref<number>(0);

export const setCurrentRightClickedItem = (item: Chat | Message<any> | PathInfoModel, type: RIGHT_CLICK_TYPE) => {
    triggerWatchOnRightClickItem.value = !triggerWatchOnRightClickItem;
    currentRightClickedItem.value = {
        type: type,
        data: item,
    };
};

export const rightClickedItemIsMessage = (
    item: ICurrentRightClickItem<any>
): item is ICurrentRightClickItem<Message<any>> => {
    return item.type === RIGHT_CLICK_TYPE.MESSAGE;
};

export const rightClickedItemIsChat = (item: ICurrentRightClickItem<any>): item is ICurrentRightClickItem<Chat> => {
    return item.type === RIGHT_CLICK_TYPE.CHAT_CARD;
};

export const rightClickedItemIsFile = (
    item: ICurrentRightClickItem<any>
): item is ICurrentRightClickItem<PathInfoModel> => {
    return item.type === RIGHT_CLICK_TYPE.LOCAL_FILE;
};
