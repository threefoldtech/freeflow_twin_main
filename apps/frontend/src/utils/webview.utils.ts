import { sleep } from '@/utils/index';
import { ref } from 'vue';

export let isUserMobile = ref<boolean>(false);

export const retrieveFirebaseIdentifier = async (): Promise<string> => {
    // Sleep is needed due race conditions
    await sleep(1);

    let firebaseIdentifier = await globalThis.flutter_inappwebview.callHandler('RETRIEVE_IDENTIFIER');

    return firebaseIdentifier ?? '';
};
