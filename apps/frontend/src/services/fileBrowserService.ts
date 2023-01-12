import axios, { AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import config from '@/config';
import { createPercentProgressNotification, fail, success, updateNotification } from '@/store/notificiationStore';
import { ContactInterface, SharedFileInterface } from '@/types';
import { calcExternalResourceLink } from './urlService';
import { accessDenied, PathInfoModel } from '@/store/fileBrowserStore';
import { useSocketActions } from '@/store/socketStore';
import { FileAction } from 'custom-types/file-actions.type';
import { showUserOfflineMessage } from '@/store/statusStore';
import Spinner from '@/components/Spinner.vue';

const endpoint = `${config.baseUrl}api/v2/quantum`;

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

export interface GetShareToken {
    token: string;
}

export interface EditPathInfo extends PathInfoModel {
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

export const createDirectory = async (path: string, name: string): Promise<AxiosResponse<PathInfo>> => {
    const body = {
        path,
        name: `/${name}`,
    };
    return await axios.post<PathInfo>(`${config.baseUrl}api/v2/quantum/dir`, body);
};

export const getFileInfo = async (
    path: string,
    location?: string,
    attachments: boolean = false
): Promise<AxiosResponse<EditPathInfo>> => {
    const params = new URLSearchParams();
    params.append('path', path);
    params.append('attachments', String(attachments));
    if (location) params.append('location', location);
    return await axios.get(`${config.baseUrl}api/v2/quantum/file/info`, { params: params });
};

export const uploadFile = async (path: string, file: File): Promise<AxiosResponse<PathInfo>> => {
    const { sendHandleUploadedFile } = useSocketActions();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    let cfg = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    } as AxiosRequestConfig;

    const notification = createPercentProgressNotification('Uploading file', file.name, 0);
    cfg = {
        ...cfg,
        onUploadProgress: function (progressEvent) {
            notification.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100) / 100;
            if (notification.progress === 1) return;
            updateNotification(notification);
        },
    };

    try {
        const response = await axios.post(`${config.baseUrl}api/v2/files/upload`, formData, cfg);
        if (response.status >= 300) {
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
    return await axios.delete<PathInfo>(`${config.baseUrl}api/v2/quantum/file/internal?path=${btoa(path)}`);
};

export const downloadFileEndpoint = `${config.baseUrl}api/v2/files/download/compressed`;

export const getDownloadFileEndpoint = (path: string) => {
    return `${downloadFileEndpoint}?path=${btoa(path)}`;
};

export const downloadFile = async (path: string, responseType: ResponseType = 'blob') => {
    return await axios.get(getDownloadFileEndpoint(path), {
        responseType: responseType,
    });
};

export const searchDir = async (searchTerm: string, currentDir: string) => {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    params.append('dir', currentDir);
    return await axios.get<PathInfo[]>(`${config.baseUrl}api/v2/quantum/search`, { params: params });
};

export const copyFiles = async (paths: string[], pathToPaste: string) => {
    return await axios.post<PathInfo[]>(`${endpoint}/files/copy`, { paths: paths, destination: pathToPaste });
};

export const moveFiles = async (paths: string[], pathToPaste: string) => {
    return await axios.post<PathInfo[]>(`${config.baseUrl}api/v2/quantum/move-files`, {
        paths: paths,
        destination: pathToPaste,
    });
};

export const updateFile = async (path: string, content: string, location: string, token: string, key: string) => {
    return await axios.post<PathInfo>(`${endpoint}/file/internal?path=${btoa(path)}&token=${token}`, {
        content,
        location,
        status: 2,
        key,
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

export const removeFilePermissions = async (chatId: string, path: string, location: string) => {
    return await axios.post<GetShareToken>(`${config.baseUrl}api/v2/quantum/share/permissions`, {
        chatId,
        path: btoa(path),
        loc: location,
    });
};

export const getShared = async (_shareStatus: string) => {
    return await axios.get<SharedFileInterface[]>(`${config.baseUrl}api/v2/quantum/shares/shared-with-me`);
};

export const getShareWithId = async (id: string) => {
    if (!id) return null;
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
    let externalUrl = `http://[${owner.location}]`;
    externalUrl = calcExternalResourceLink(externalUrl);

    path = encodeURIComponent(path);

    let apiEndPointToCall = `/api/v2/quantum/share/info?shareId=${shareId}&userId=${userId}&path=${path}&attachments=${attachments}`;
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
    let externalUrl = `http://[${owner.location}]`;
    externalUrl = calcExternalResourceLink(externalUrl);

    // TODO: handle in nest
    let apiEndPointToCall = `/api/v1/browse/share/${shareId}/folder?path=${path}`;

    apiEndPointToCall = encodeURIComponent(apiEndPointToCall);
    externalUrl = externalUrl + apiEndPointToCall;
    const res = await axios.get(externalUrl);
    return <PathInfoModel[]>res.data;
};

export const getShareByPath = async (path: string): Promise<SharedFileInterface> => {
    // TODO: handle in nest
    return (await axios.get(`${endpoint}/share/path?path=${btoa(path)}`)).data;
};

export const hasSpecialCharacters = (name: string) => {
    const format = /[`!@#$%^*=[\]{};':"\\|<>\/?~]/;
    return format.test(name);
};

export const generateFileBrowserUrl = (
    protocol: 'http' | 'https',
    owner: string,
    path: string,
    token: string,
    attachment: boolean = false
) => {
    path = encodeURIComponent(path);
    token = encodeURIComponent(token);
    return `${protocol}://${owner}/api/v2/quantum/file/internal?path=${path}&token=${token}&attachment=${attachment}`;
};

export const generateDocumentServerConfig = (
    location: string,
    fileDetails: EditPathInfo,
    isAttachment: boolean = false,
    isLoading: boolean = false
) => {
    const { path, key, readToken, writeToken, extension, name } = fileDetails;

    const readUrl = generateFileBrowserUrl('http', `[${location}]`, path, readToken, isAttachment);

    const writeUrl = generateFileBrowserUrl('http', `[${location}]`, path, writeToken);

    const myName = window.location.host.split('.')[0];

    return {
        document: {
            fileType: extension,
            key,
            title: name,
            url: readUrl,
        },
        height: '100%',
        width: '100%',
        editorConfig: {
            callbackUrl: writeUrl,
            customization: {
                chat: false,
                forcesave: false,
            },
            user: {
                id: myName,
                name: myName,
            },
            mode: writeToken ? 'edit' : 'view',
        },
        showUserOfflineMessage,
        isLoading,
        Spinner,
        accessDenied,
    };
};
