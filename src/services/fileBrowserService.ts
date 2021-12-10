import axios, { AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import config from '@/config';
import { createPercentProgressNotification, fail, success } from '@/store/notificiationStore';
import { ProgressNotification } from '@/types/notifications';
import { ContactInterface, FileShareMessageType, Message, MessageBodyType, SharedFileInterface } from '@/types';
import { calcExternalResourceLink } from './urlService';
import { accessDenied, currentDirectory, PathInfoModel } from '@/store/fileBrowserStore';
import { isUndefined } from 'lodash';

const endpoint = `${config.baseUrl}api/browse`;

export interface PathInfo {
    isFile: boolean;
    isDirectory: boolean;
    directory: string;
    path: string;
    fullName: string;
    name: string;
    size: number;
    extension: string;
    createdOn: Date;
    lastModified: Date;
    lastAccessed: Date;
}
export interface ShareInfo {
    [id: string]: {
        path: string;
        shares: {
            expiration: number;
            token: string;
        };
    };
}

export interface GetShareToken {
    token: string;
}

export interface EditPathInfo extends PathInfo {
    key: string;
    readToken: string;
    writeToken: string;
}

export const getDirectoryContent = async (
    path: string,
    attachments: boolean = false
): Promise<AxiosResponse<PathInfo[]>> => {
    // /user
    const params = new URLSearchParams();
    params.append('path', path);
    if (attachments) params.append('attachments', '1');
    return await axios.get<PathInfo[]>(`${endpoint}/directories/content`, { params: params });
};

export const getDirectoryInfo = async (path: string) => {
    const params = new URLSearchParams();
    params.append('path', path);
    return await axios.get(`${endpoint}/directories/info`, { params: params });
};

export const createDirectory = async (path: string, name: string): Promise<AxiosResponse<PathInfo>> => {
    const body = {
        path,
        name,
    };
    return await axios.post<PathInfo>(`${endpoint}/directories`, body);
};

export const getFileInfo = async (path: string, attachments: boolean): Promise<AxiosResponse<EditPathInfo>> => {
    const params = new URLSearchParams();
    params.append('path', path);
    params.append('attachments', String(attachments));
    return await axios.get(`${endpoint}/files/info`, { params: params });
};

export const uploadFile = async (
    path: string,
    file: File,
    withNotification = true
): Promise<AxiosResponse<PathInfo>> => {
    const formData = new FormData();
    formData.append('newFiles', file);
    formData.append('path', path);
    let config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    } as AxiosRequestConfig;

    let notification: ProgressNotification | undefined = undefined;
    if (withNotification) {
        notification = createPercentProgressNotification('Uploading file', file.name, 0);
        config = {
            ...config,
            onUploadProgress: function (progressEvent) {
                //console.log('test', Math.round((progressEvent.loaded * 100) / progressEvent.total));
                notification.progress = Math.round(progressEvent.loaded / progressEvent.total);
            },
        };
    }
    try {
        const response = await axios.post<PathInfo>(`${endpoint}/files`, formData, config);
        if (withNotification && response.status >= 300) {
            notification.title = 'Upload failed';
            fail(notification);
        } else {
            notification.title = 'Upload Success';
            success(notification);
        }

        return response;
    } catch (ex) {
        if (!withNotification) return;
        if (ex.message === 'Request failed with status code 413') {
            notification.title = 'File is too big!';
            fail(notification);
            return;
        }
        notification.title = 'Upload failed';
        fail(notification);
    }
};

export const deleteFile = async (path: string) => {
    return await axios.delete<PathInfo>(`${endpoint}/files`, { data: { filepath: path } });
};

export const downloadFileEndpoint = `${endpoint}/files`;
export const getDownloadFileEndpoint = (path: string) => {
    return `${downloadFileEndpoint}?path=${path}`;
};

export const downloadFile = async (path: string, responseType: ResponseType = 'blob') => {
    return await axios.get(getDownloadFileEndpoint(path), {
        responseType: responseType,
    });
};

export const getChatsWithAttachments = async () => {
    return await axios.get(`${endpoint}/attachments`);
};

export const searchDir = async (searchTerm: string, currentDir: string) => {
    const params = new URLSearchParams();
    params.append('searchTerm', searchTerm);
    params.append('currentDir', currentDir);
    return await axios.get<PathInfo[]>(`${endpoint}/files/search`, { params: params });
};
export const copyFiles = async (paths: string[], pathToPaste: string) => {
    return await axios.post<PathInfo[]>(`${endpoint}/files/copy`, { paths: paths, destinationPath: pathToPaste });
};

export const moveFiles = async (paths: string[], pathToPaste: string) => {
    return await axios.post<PathInfo[]>(`${endpoint}/files/move`, { paths: paths, destinationPath: pathToPaste });
};

export const renameFile = async (oldPath: string, newPath: string) => {
    return await axios.put<PathInfo>(`${endpoint}/files/rename`, { oldPath: oldPath, newPath: newPath });
};
export const addShare = async (userId: string, path: string, filename: string, size: number, writable: boolean) => {
    return await axios.post<GetShareToken>(`${endpoint}/files/share`, {
        chatId: userId,
        writable: writable,
        path: path,
        filename: filename,
        size: size,
    });
};
export const removeFilePermissions = async (userId: string, path: string, location: string) => {
    return await axios.post<GetShareToken>(`${endpoint}/files/removeFilePermissions`, {
        chatId: userId,
        path: path,
        location: location,
    });
};

export const getShared = async (shareStatus: string) => {
    const params = new URLSearchParams();
    params.append('shareStatus', shareStatus);
    return await axios.get<SharedFileInterface[]>(`${endpoint}/files/getShares`, { params: params });
};
export const getShareWithId = async (id: string) => {
    const params = new URLSearchParams();
    params.append('id', id);
    const res = await axios.get(`${endpoint}/files/getShareWithId`, { params: params });
    if (res.data['message'] === 'ACCESS_DENIED') {
        accessDenied.value = true;
        return;
    }
    return <SharedFileInterface>res.data;
};

export const getFileAccessDetails = async (
    owner: ContactInterface,
    shareId: string,
    userId: string,
    path: string,
    attachments: boolean
) => {
    let externalUrl = `http://[${owner.location}]`;
    externalUrl = calcExternalResourceLink(externalUrl);

    path = encodeURIComponent(path);

    let apiEndPointToCall = `/api/browse/files/getShareFileAccessDetails?shareId=${shareId}&userId=${userId}&path=${path}&attachments=${attachments}`;
    apiEndPointToCall = encodeURIComponent(apiEndPointToCall);

    externalUrl = externalUrl + apiEndPointToCall;
    const res = await axios.get(externalUrl);
    return <EditPathInfo>res.data;
};

export const getSharedFolderContent = async (
    owner: ContactInterface,
    shareId: string,
    userId: string,
    path: string
) => {
    let externalUrl = `http://[${owner.location}]`;
    externalUrl = calcExternalResourceLink(externalUrl);

    let apiEndPointToCall = `/api/browse/share/${shareId}/folder?path=${path}`;

    apiEndPointToCall = encodeURIComponent(apiEndPointToCall);
    externalUrl = externalUrl + apiEndPointToCall;
    const res = await axios.get(externalUrl);
    return <PathInfoModel[]>res.data;
};

export const getShareByPath = async (path: string): Promise<SharedFileInterface> => {
    return (await axios.get(`${endpoint}/share/path/`, { params: { path } })).data;
};

export const downloadAttachment = async (message: any) => {
    console.log(`${endpoint}/attachment/download`);
    return (
        await axios.get(`${endpoint}/attachment/download`, { params: { owner: message.from, path: message.body.url } })
    ).data;
};
