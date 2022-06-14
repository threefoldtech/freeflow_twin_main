import axios, { AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import config from '@/config';
import { createNotification, createPercentProgressNotification, fail, success } from '@/store/notificiationStore';
import { ProgressNotification, Status } from '@/types/notifications';
import { ContactInterface, SharedFileInterface } from '@/types';
import { calcExternalResourceLink } from './urlService';
import { accessDenied, PathInfoModel } from '@/store/fileBrowserStore';
import { useSocketActions } from '@/store/socketStore';
import { FileAction } from 'custom-types/file-actions.type';

const endpoint = `${config.baseUrl}api/v1/browse`;

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
    return await axios.get<PathInfo[]>(`${config.baseUrl}api/v2/quantum/dir/content`, { params: params });
};

export const getDirectoryInfo = async (path: string) => {
    const params = new URLSearchParams();
    params.append('path', path);
    return await axios.get(`${config.baseUrl}api/v2/quantum/dir/info`, { params: params });
};

export const createDirectory = async (path: string, name: string): Promise<AxiosResponse<PathInfo>> => {
    const body = {
        path,
        name: `/${name}`,
    };
    return await axios.post<PathInfo>(`${config.baseUrl}api/v2/quantum/dir`, body);
};

export const getFileInfo = async (path: string, attachments: boolean = false): Promise<AxiosResponse<EditPathInfo>> => {
    const params = new URLSearchParams();
    params.append('path', path);
    params.append('attachments', String(attachments));
    return await axios.get(`${config.baseUrl}api/v2/quantum/file/info`, { params: params });
};

export const uploadFile = async (
    path: string,
    file: File,
    withNotification = true
): Promise<AxiosResponse<PathInfo>> => {
    const { sendHandleUploadedFile } = useSocketActions();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    let cfg = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    } as AxiosRequestConfig;

    let notification: ProgressNotification | undefined = undefined;
    if (withNotification) {
        notification = createPercentProgressNotification('Uploading file', file.name, 0);
        cfg = {
            ...cfg,
            onUploadProgress: function (progressEvent) {
                //console.log('test', Math.round((progressEvent.loaded * 100) / progressEvent.total));
                notification.progress = Math.round(progressEvent.loaded / progressEvent.total);
            },
        };
    }
    try {
        const response = await axios.post(`${config.baseUrl}api/v2/files/upload`, formData, cfg);
        if (withNotification && response.status >= 300) {
            notification.title = 'Upload failed';
            fail(notification);
        } else {
            notification.title = 'Upload Success';
            success(notification);
        }

        const { data } = response;
        if (!data.id) return;
        sendHandleUploadedFile({
            fileId: String(data.id),
            payload: { filename: data.filename, path },
            action: FileAction.ADD_TO_QUANTUM,
        });

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
    return await axios.delete<PathInfo>(`${config.baseUrl}api/v2/files?path=${path}`);
};

export const downloadFileEndpoint = `${config.baseUrl}api/v2/files/download/compressed`;
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
    params.append('search', searchTerm);
    params.append('dir', currentDir);
    return await axios.get<PathInfo[]>(`${config.baseUrl}api/v2/quantum/search`, { params: params });
};
export const copyFiles = async (paths: string[], pathToPaste: string) => {
    return await axios.post<PathInfo[]>(`${endpoint}/files/copy`, { paths: paths, destinationPath: pathToPaste });
};

export const moveFiles = async (paths: string[], pathToPaste: string) => {
    return await axios.post<PathInfo[]>(`${config.baseUrl}api/v2/quantum/move-files`, {
        paths: paths,
        destination: pathToPaste,
    });
};

export const renameFile = async (oldPath: string, newPath: string) => {
    return await axios.put<PathInfo>(`${config.baseUrl}api/v2/quantum/rename`, { from: oldPath, to: newPath });
};
export const addShare = async (userId: string, path: string, filename: string, size: number, writable: boolean) => {
    return await axios.post<GetShareToken>(`${config.baseUrl}api/v2/quantum/share`, {
        userId,
        isWritable: writable,
        path,
        isPublic: false,
        filename,
        size,
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
    return await axios.get<SharedFileInterface[]>(`${config.baseUrl}api/v2/quantum/shares/shared-with-me`);
};
export const getShareWithId = async (id: string) => {
    const params = new URLSearchParams();
    params.append('id', id);
    params.append('attachments', 'false');
    const res = await axios.get(`${config.baseUrl}api/v2/quantum/share`, { params: params });
    if (!res.data) {
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
    let externalUrl = `https://[${owner.location}]`;
    externalUrl = calcExternalResourceLink(externalUrl);

    path = encodeURIComponent(path);

    let apiEndPointToCall = `/api/v1/browse/files/getShareFileAccessDetails?shareId=${shareId}&userId=${userId}&path=${path}&attachments=${attachments}`;
    apiEndPointToCall = encodeURIComponent(apiEndPointToCall);

    externalUrl = externalUrl + apiEndPointToCall;
    const res = await axios.get(externalUrl);
    return <EditPathInfo>res.data;
};

export const getSharedFolderContent = async (
    owner: ContactInterface,
    shareId: string,
    _userId: string,
    path: string
) => {
    let externalUrl = `https://[${owner.location}]`;
    externalUrl = calcExternalResourceLink(externalUrl);

    let apiEndPointToCall = `/api/v1/browse/share/${shareId}/folder?path=${path}`;

    apiEndPointToCall = encodeURIComponent(apiEndPointToCall);
    externalUrl = externalUrl + apiEndPointToCall;
    const res = await axios.get(externalUrl);
    return <PathInfoModel[]>res.data;
};

export const getShareByPath = async (path: string): Promise<SharedFileInterface> => {
    return (await axios.get(`${endpoint}/share/path/`, { params: { path } })).data;
};

export const downloadAttachment = async (message: any) => {
    createNotification('Downloading attachment', `from ${message.from}`, Status.Info);
    try {
        const msgUrl = message.body.url;
        const response = await axios.get(`${endpoint}/attachment/download`, {
            params: { owner: message.from, path: msgUrl, to: message.to, messageId: message.id },
        });
        createNotification('Attachment successfully downloaded', `from ${message.from}`, Status.Success);
        return response?.data;
    } catch (ex) {
        createNotification('Something went wrong during the download', `from ${message.from}`, Status.Error);
        return;
    }
};

export const hasSpecialCharacters = (name: string) => {
    const format = /[`!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/;
    return format.test(name);
};
