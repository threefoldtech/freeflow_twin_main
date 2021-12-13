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
import { stringifyQuery } from 'vue-router';

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


const listenSocket = (route: string, params: Object): Promise<any> => {
    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit(route, { ...params }, function (result) {
        if (result.error)
            throw new Error(route+ '  Failed in backend', result.error)
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


export const sendGetDirectoryContent = (path: string) => {
    const route = "get_directory_content";
    return listenSocket(route, {
        path: path
    } );
}



export const sendCreateDirectory = async (path: string, name: string) : Promise<PathInfo> =>{
    const route = "create_directory";
    return await <Promise<PathInfo>>listenSocket(route, {
        path: path,
        name: name,
    }) ;
}

export const getFileInfo = async (path: string): Promise<AxiosResponse<EditPathInfo>> => {
    const params = new URLSearchParams();
    params.append('path', path);
    return await axios.get(`${endpoint}/files/info`, { params: params });
};


export const sendGetFileInfo = async(path:string)=>{

}

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

export const sendDeleteFile = async (path: string): Promise<any> => {
    const route = 'delete_file'
    return await listenSocket(route, {
        path: path
    });
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
    const route = 'search_dir'
    return await listenSocket(route, {'searchTerm':searchTerm, 'currentDir':currentDir})

}

export const sendCopyFiles = async(paths: string[], pathToPaste: string)=>{
    const route = 'copy_files'
    return await listenSocket(route, {
        paths: paths,
        destinationPath: pathToPaste
    })
}

export const sendMoveFiles = async(paths: string[], pathToMove: string) =>{
    const route = 'move_file'
    return await listenSocket(route, {paths: paths, destinationPath: pathToMove})
}

export const sendRenameFile = async(oldPath: string, newPath: string) =>{
    const route = 'rename_file'
    return await listenSocket(route, {oldPath: oldPath, newPath: newPath})
}

export const sendAddShare = async(userId: string, path: string, filename: string, size: number, writable: boolean) =>{
    const route = 'add_share'
    return await listenSocket(route, {
        chatId: userId,
        writable: writable,
        path: path,
        filename: filename,
        size: size,
    })
}

export const sendRemoveFilePermissions = async(userId: string, path: string, location: string) =>{
    // const params = {
    //     chatId: userId,
    //     path: path,
    //     location: location,
    // }

    // const { user } = useAuthState();
    // const isSocketInit = <boolean>useSocket();
    // if (!isSocketInit) initializeSocket(user.id.toString())
    // const socket = useSocket();

    // const callToWebSocket = (res) => socket.emit("remove_file_permissions", { params }, function (result) {
    //     if (result.error)
    //         throw new Error('remove_file_permissions Failed in backend', result.error)
    //     res(result)
    // });

    // const functionWithPromise = () => {
    //     return new Promise((res) => {
    //         callToWebSocket(res);
    //     });
    // };

    // return functionWithPromise().then(val => {
    //     return val;
    // })
    const route = 'remove_file_permissions'
    return await listenSocket(route, {
        chatId: userId,
        path: path,
        location: location,
    })

}

export const getShared = async (shareStatus: string) => {
    const params = new URLSearchParams();
    params.append('shareStatus', shareStatus);
    return await axios.get<SharedFileInterface[]>(`${endpoint}/files/getShares`, { params: params });
};

export const sendGetShared = async(path:string): Promise<SharedFileInterface> =>{
    // const params = {
    //     path: path}
    // const { user } = useAuthState();
    // const isSocketInit = <boolean>useSocket();
    // if (!isSocketInit) initializeSocket(user.id.toString())
    // const socket = useSocket();
    // const callToWebSocket = (res) => socket.emit("get_share_by_path", { params }, function (result) {
    //     if (result.error)
    //         throw new Error('get_share_by_path Failed in backend', result.error)
    //     res(result)
    // });

    // const functionWithPromise = () => {
    //     return new Promise((res) => {
    //         callToWebSocket(res);
    //     });
    // };

    // return functionWithPromise().then(val => {
    //     return val;
    // })

    const route = 'get_share_by_path'
    return  <Promise<SharedFileInterface>>listenSocket(route, {
        path: path});
}



export const sendGetShareWithId = async(id: string): Promise<SharedFileInterface> =>{
    const route = 'get_share_with_id'
    return  <Promise<SharedFileInterface>>listenSocket(route, {
        id: id})
}

// @external endpoint
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

    // @external endpoint
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

export const sendGetShareByPath = async(path:string)=>{
// : Promise<SharedFileInterface> 

    // console.log("getting here")
    // const params = {
    //     path: path}
    // const { user } = useAuthState();
    // const isSocketInit = <boolean>useSocket();
    // if (!isSocketInit) initializeSocket(user.id.toString())
    // const socket = useSocket();
    // const callToWebSocket = (res) => socket.emit("get_share_by_path", { params }, function (result) {
    //     if (result.error)
    //         throw new Error('get_share_by_path Failed in backend', result.error)
    //     res(result)
    // });

    // const functionWithPromise = () => {
    //     return new Promise((res) => {
    //         callToWebSocket(res);
    //     });
    // };

    // return functionWithPromise().then(val => {
    //     return <SharedFileInterface>val;
    // })

    const route = 'get_share_by_path'
    return  await (listenSocket(route, {
        path: path}))
}

