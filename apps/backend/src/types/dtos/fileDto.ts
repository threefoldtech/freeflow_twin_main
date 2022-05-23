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

export interface FileInformation {
    data: Buffer;
    name: string;
}

export interface DirectoryContent {
    isFile: boolean;
    isDirectory: boolean;
    name: string;
}

export interface DirectoryDto {
    name: string;
    path: string;
}

export interface FileDto {
    path: string;
}
