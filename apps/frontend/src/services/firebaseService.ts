import axios from 'axios';
import config from '../config';
import { useAuthState } from '@/store/authStore';
import { isUserMobile, retrieveFirebaseIdentifier } from '@/utils/webview.utils';

export interface PostNotificationDto {
    message: string;
    sender: string;
    group: string;
}

export const sendIdentifierToBackend = async (): Promise<void> => {
    console.log('Saving identifier to backend');
    const { user } = useAuthState();

    const identifier = await retrieveFirebaseIdentifier();

    if (!identifier || identifier == '') {
        isUserMobile.value = false;
        return;
    }

    isUserMobile.value = true;

    const appId = user.id + '.' + config.getAppId();

    console.log('Posting to :', `${config.baseUrl}api/v2/firebase/identify`);
    console.log('Data: ', { appId: appId, identifier: identifier });
    try {
        await axios.post(`${config.baseUrl}api/v2/firebase/identify`, { appId: appId, identifier: identifier });
    } catch (e) {
        console.log(e);
        return;
    }
};

export const sendNotificationToBackend = async (notificationData: PostNotificationDto): Promise<void> => {
    console.log('Posting notification to backend');
    const { user } = useAuthState();

    const timestamp = new Date().getTime();
    const appId = user.id + '.' + config.getAppId();

    const data = {
        timestamp: timestamp.toString(),
        message: 'sent you a message',
        sender: notificationData.sender,
        group: notificationData.group,
        me: user.id,
        appId: appId,
    };

    console.log('Posting to :', `${config.baseUrl}api/v2/firebase/notify`);
    console.log('Data: ', data);
    try {
        await axios.post(`${config.baseUrl}api/v2/firebase/notify`, data);
    } catch (e) {
        console.log(e);
        return;
    }
};
