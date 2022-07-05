import PATH from 'path';

import fs, { ObjectEncodingOptions, promises as FS, Stats, lstatSync, rmdirSync, statSync } from 'fs';
import { FileSystemError, FileSystemErrorType as ErrorType } from '../../types/errors/fileSystemError';
import { PathInfo } from '../../types/dtos/fileDto';
import { config } from '../../config/config';
import { UploadedFile } from 'express-fileupload';
import * as fse from 'fs-extra';
import { updateShareName, updateSharePath } from '../../service/fileShareService';
import { getShareConfig } from '../../service/dataService';

let baseDir = PATH.join(config.baseDir, config.storage);

export class Path {
    private _path: string;
    private _securedPath: string;

    constructor(path: string, dir?: string, attachment?: boolean) {
        dir ? (baseDir = dir) : attachment ? (baseDir = '/appdata/attachments') : (baseDir = '/appdata/storage');
        this._path = path;
        this.setSecuredPath();
    }

    public setSecuredPath() {
        const realPath = PATH.join(baseDir, this._path);
        if (realPath.indexOf(baseDir) !== 0)
            throw new FileSystemError(ErrorType.ForbidTraversal, 'Traversal not allowed!');

        this._securedPath = realPath;
    }

    public setPath(path: string) {
        this._path = path;
        this.setSecuredPath();
    }

    public appendPath(path: string) {
        this._path = PATH.join(this._path, path);
        this.setSecuredPath();
    }

    public get path() {
        return this._path;
    }

    public get securedPath() {
        return this._securedPath;
    }
}

export const getStats = (path: Path): Promise<Stats> => {
    console.log('---------------------', path);
    if (!pathExists(path)) throw new FileSystemError(ErrorType.FileNotFound, 'fileDoesNotExist');

    return FS.stat(path.securedPath);
};

export const getFile = async (path: Path): Promise<Buffer> => {
    if (!pathExists(path)) throw new FileSystemError(ErrorType.FileNotFound, 'fileDoesNotExist');

    return await readFile(path);
};

export const getFormattedDetails = async (path: Path): Promise<PathInfo> => {
    const stats = await getStats(path);
    const details = PATH.parse(path.securedPath);
    const extension = details.ext.replace('.', '');
    return {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        directory: details.dir.replace(baseDir, ''),
        path: path.path,
        fullName: details.base,
        name: details.name,
        extension: extension,
        size: stats.size,
        createdOn: stats.ctime,
        lastModified: stats.mtime,
        lastAccessed: stats.atime,
    };
};

export const pathExists = (path: Path): boolean => {
    return fse.existsSync(path.securedPath);
};

export const createDir = async (path: Path): Promise<PathInfo> => {
    await createDirectory(path);
    return await getFormattedDetails(path);
};

export const readDir = async (
    path: Path,
    options: { withFileTypes: true },
    attachments: boolean = false
): Promise<PathInfo[]> => {
    const exists = await pathExists(path);
    if (!exists) return [];
    const content = await readDirectory(path, options);
    return (
        await Promise.all(
            content.map(c => {
                if (c.isBlockDevice() || c.isCharacterDevice() || c.isSymbolicLink() || c.isSocket()) return;

                let itemPath;
                attachments
                    ? (itemPath = new Path(path.path, '/appdata/attachments'))
                    : (itemPath = new Path(path.path));
                itemPath.appendPath(c.name);
                return getFormattedDetails(itemPath);
            })
        )
    ).filter(c => c) as PathInfo[];
};

export const isPathDirectory = async (path: Path): Promise<boolean> => {
    try {
        return await lstatSync(path.securedPath).isDirectory();
    } catch (e) {
        return false;
    }
};

export const getNameWithCount = async (source: Path, count = 0) => {
    const details = await getFormattedDetails(source);
    if (!count) return details.fullName;
    if (details.isDirectory) return `${details.fullName} (${count})`;
    return `${details.name} (${count})${details.extension ? `.${details.extension}` : undefined}`;
};

export const createDirectoryWithRetry = async (path: Path, count = 0): Promise<PathInfo> => {
    const pathCount = count === 0 ? path : new Path(`${path.path} (${count})`);
    if (pathExists(pathCount)) return await createDirectoryWithRetry(path, count + 1);

    return await createDir(path);
};

export const saveFileWithRetry = async (path: Path, file: UploadedFile, count = 0, dir?: string): Promise<PathInfo> => {
    //console.log('->>>> RETRY', path);
    const pathCount = count === 0 ? path : new Path(path.path.insert(path.path.lastIndexOf('.'), ` (${count})`), dir);

    if (pathExists(pathCount)) return await saveFileWithRetry(path, file, count + 1, dir);
    return await saveUploadedFile(pathCount, file);
};

export const copyWithRetry = async (source: Path, destinationDirectory: Path, count = 0): Promise<PathInfo> => {
    const name = await getNameWithCount(source, count);
    const destinationCount = new Path(PATH.join(destinationDirectory.path, name));
    if (pathExists(destinationCount)) return copyWithRetry(source, destinationDirectory, count + 1);

    return copy(source, destinationCount);
};

export const moveWithRetry = async (source: Path, destinationDirectory: Path, count = 0): Promise<PathInfo> => {
    const name = await getNameWithCount(source, count);
    const destinationCount = new Path(PATH.join(destinationDirectory.path, name));
    if (pathExists(destinationCount)) return moveWithRetry(source, destinationDirectory, count + 1);

    return move(source, destinationCount);
};

export const saveUploadedFile = async (path: Path, file: UploadedFile) => {
    if (file.tempFilePath) return await moveUploadedFile(file, path);

    return saveFile(path, file.data);
};

export const moveUploadedFile = async (file: UploadedFile, path: Path) => {
    const directory = new Path(path.path.removeAfterLastOccurrence('/'));
    if (!pathExists(directory)) await createDir(directory);

    await file.mv(path.securedPath);
    return await getFormattedDetails(path);
};

export const saveFile = async (path: Path, file: Buffer) => {
    const directory = new Path(path.path.removeAfterLastOccurrence('/'), undefined, true);
    if (!pathExists(directory)) await createDir(directory);
    await writeFile(path, file);
    return await getFormattedDetails(path);
};

export const copy = async (source: Path, destination: Path) => {
    fse.copySync(source.securedPath, destination.securedPath, {
        errorOnExist: true,
        overwrite: false,
        recursive: true,
    });
    return await getFormattedDetails(destination);
};

export const move = async (source: Path, destination: Path) => {
    let config = getShareConfig();
    const share = config.Shared.find(share => share.path == source.path);

    if (share) {
        updateSharePath(source.path, destination.path);
    }
    fse.moveSync(source.securedPath, destination.securedPath, {
        overwrite: false,
    });
    return await getFormattedDetails(destination);
};

export const getFilesRecursive = async (dir: Path, fileList: PathInfo[] = []) => {
    let files = await readDir(dir, { withFileTypes: true });
    for (const file of files) {
        if (statSync(PATH.join(dir.securedPath, file.fullName)).isDirectory()) {
            fileList.push(file);
            fileList = await getFilesRecursive(new Path(PATH.join(dir.path, file.fullName)), fileList);
        } else {
            fileList.push(file);
        }
    }
    return fileList;
};

export const filterOnString = async (term: string, fileList: PathInfo[] = []) => {
    let filteredList = [];
    for (const file of fileList) {
        if (file.fullName.toLowerCase().includes(term.toLowerCase())) {
            filteredList.push(file);
        }
    }
    return filteredList;
};

const readFile = async (path: Path) => {
    return await FS.readFile(path.securedPath);
};

const createDirectory = (path: Path) => {
    return FS.mkdir(path.securedPath, { recursive: true });
};

const readDirectory = async (path: Path, options: ObjectEncodingOptions & { withFileTypes: true }) => {
    return await FS.readdir(path.securedPath, options);
};

const writeFile = async (path: Path, file: Buffer) => {
    return await FS.writeFile(path.securedPath, file);
};

export const removeFile = async (path: Path) => {
    if (await isPathDirectory(path)) return rmdirSync(path.securedPath, { recursive: true });

    if (!pathExists(path)) throw new FileSystemError(ErrorType.FileNotFound);

    return await FS.rm(path.securedPath);
};

export const renameFile = async (oldPath: Path, newPath: Path) => {
    if (!pathExists(oldPath) || pathExists(newPath)) {
        return;
    }
    return await FS.rename(oldPath.securedPath, newPath.securedPath);
};
