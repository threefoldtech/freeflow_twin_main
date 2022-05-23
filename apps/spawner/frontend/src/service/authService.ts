import { popupCenter } from './popupService';

export const login = (name: string): Promise<void> => {
    return new Promise(resolve => {
        const loginUrl = '/api/v1/auth/signin/' + name;
        const popup = popupCenter(loginUrl, 'Threefold login', 800, 550);
        window.onmessage = async (e: MessageEvent) => {
            if (e.data.message !== 'LoginRedirectSuccess') {
                return;
            }
            popup?.close();
            resolve();
        };
    });
};
