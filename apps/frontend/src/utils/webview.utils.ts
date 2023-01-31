import { sleep } from '@/utils/index';

export const retrieveFirebaseIdentifier = async (): Promise<string> => {
    // Sleep is needed due race conditions
    await sleep(1);

    let firebaseIdentifier = await globalThis.flutter_inappwebview.callHandler('RETRIEVE_IDENTIFIER');

    return firebaseIdentifier ?? '';
};

globalThis.RECEIVED_APP_BACKGROUND = () => {
    console.log('RECEIVED APP IN BACKGROUND');
};

globalThis.RECEIVED_APP_FOREGROUND = () => {
    console.log('RECEIVED APP IN FOREGROUND');
};
