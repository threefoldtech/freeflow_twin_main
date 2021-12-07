import axios, { AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import config from '@/config';
import { createPercentProgressNotification, fail, success } from '@/store/notificiationStore';
import { ProgressNotification } from '@/types/notifications';
import { ContactInterface, SharedFileInterface } from '@/types';
import { calcExternalResourceLink } from './urlService';
import { accessDenied, PathInfoModel } from '@/store/fileBrowserStore';
import { useSocket } from '@/plugins/SocketIo';
import { useAuthState } from '@/store/authStore';
import { initializeSocket } from '@/store/socketStore';

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



export const sendGetDirectoryContent = (path: string) => {
    // const params = new URLSearchParams();
    // params.append('path', path);
    // console.log(params.toString())

    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit("get_directory_content", { path }, function (result) {
        if (result.error)
            throw new Error('get_directory_content Failed in backend', result.error)
        res(result)
    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebSocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}

export const createDirectory = async (path: string, name: string): Promise<AxiosResponse<PathInfo>> => {
    const body = {
        path,
        name,
    };
    return await axios.post<PathInfo>(`${endpoint}/directories`, body);
};

export const getFileInfo = async (path: string): Promise<AxiosResponse<EditPathInfo>> => {
    const params = new URLSearchParams();
    params.append('path', path);
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

export const sendDeleteFile = (path: string): any => {
    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit("delete_file", { path }, function (result) {
        if (result.error)
            throw new Error('delete_file Failed in backend', result.error)
        res(result)
    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebSocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}




export const downloadFileEndpoint = `${endpoint}/files`;
export const getDownloadFileEndpoint = (path: string) => {
    return `${downloadFileEndpoint}?path=${path}`;
};

export const downloadFile = async (path: string, responseType: ResponseType = 'blob') => {
    return await axios.get(getDownloadFileEndpoint(path), {
        responseType: responseType,
    });
};

export const sendSearchDir = async (searchTerm: string, currentDir: string) => {
    const params = {
        'searchTerm': searchTerm,
        'currentDir': currentDir
    }


    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit("search_dir", { params }, function (result) {
        if (result.error)
            throw new Error('search_dir Failed in backend', result.error)
        res(result)
    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebSocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })

}

export const sendCopyFiles = async(paths: string[], pathToPaste: string)=>{
    console.log('p',pathToPaste)
    const params = { paths: paths, destinationPath: pathToPaste };

    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();
    console.log("komt hier ")
    const callToWebSocket = (res) => socket.emit("copy_files", { params }, function (result) {
        if (result.error)
            throw new Error('copy_files Failed in backend', result.error)
            console.log(result)
        res(result)
    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebSocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}

export const sendMoveFiles = async(paths: string[], pathToMove: string) =>{

    const params = { paths: paths, destinationPath: pathToMove };

    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit("move_file", { params }, function (result) {
        if (result.error)
            throw new Error('move_file Failed in backend', result.error)
        res(result)
    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebSocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}

// export const renameFile = async (oldPath: string, newPath: string) => {
//     // return sendRenameFile(oldPath, newPath)
//     // return await axios.put<PathInfo>(`${endpoint}/files/rename`, { oldPath: oldPath, newPath: newPath });
// };

export const sendRenameFile = async(oldPath: string, newPath: string) =>{

    const params = { oldPath: oldPath, newPath: newPath };
    console.log('p', params)

    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit("rename_file", { params }, function (result) {
        if (result.error)
            throw new Error('rename_file Failed in backend', result.error)
        res(result)
    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebSocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}
// export const addShare = async (userId: string, path: string, filename: string, size: number, writable: boolean) => {
//     return sendAddShare(userId, path, filename, size, writable);
//     return await axios.post<GetShareToken>(`${endpoint}/files/share`, {
//         chatId: userId,
//         writable: writable,
//         path: path,
//         filename: filename,
//         size: size,
//     });
// };

export const sendAddShare = async(userId: string, path: string, filename: string, size: number, writable: boolean) =>{

    const params = {
        chatId: userId,
        writable: writable,
        path: path,
        filename: filename,
        size: size,
    };

    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit("add_share", { params }, function (result) {
        if (result.error)
            throw new Error('add_share Failed in backend', result.error)
        res(result)
    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebSocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}

// export const removeFilePermissions = async (userId: string, path: string, location: string) => {
//     console.log(userId, path);
//     return sendRemoveFilePermissions(userId, path, location);
//     return await axios.post<GetShareToken>(`${endpoint}/files/removeFilePermissions`, {
//         chatId: userId,
//         path: path,
//         location: location,
//     });
// };

export const sendRemoveFilePermissions = async(userId: string, path: string, location: string) =>{
    const params = {
        chatId: userId,
        path: path,
        location: location,
    }

    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit("remove_file_permissions", { params }, function (result) {
        if (result.error)
            throw new Error('remove_file_permissions Failed in backend', result.error)
        res(result)
    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebSocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}

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

export const getFileAccessDetails = async (owner: ContactInterface, shareId: string, userId: string, path: string) => {
    let externalUrl = `http://[${owner.location}]`;
    externalUrl = calcExternalResourceLink(externalUrl);

    path = encodeURIComponent(path);

    let apiEndPointToCall = `/api/browse/files/getShareFileAccessDetails?shareId=${shareId}&userId=${userId}&path=${path}`;
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
    //console.log('path in call--------------------', path);

    let apiEndPointToCall = `/api/browse/share/${shareId}/folder?path=${path}`;

    apiEndPointToCall = encodeURIComponent(apiEndPointToCall);
    //console.log(apiEndPointToCall);
    externalUrl = externalUrl + apiEndPointToCall;
    const res = await axios.get(externalUrl);
    return <PathInfoModel[]>res.data;
};

export const getShareByPath = async (path: string): Promise<SharedFileInterface> => {
    return (await axios.get(`${endpoint}/share/path/`, { params: { path } })).data;
};
export function moveFiles(items: string[], destination: string) {
    throw new Error('Function not implemented.');
}

