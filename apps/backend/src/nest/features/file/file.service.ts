import { BadRequestException, Injectable } from '@nestjs/common';
import {
    copyFile,
    Dirent,
    existsSync,
    MakeDirectoryOptions,
    mkdirSync,
    ObjectEncodingOptions,
    openSync,
    promises,
    readdir,
    readFileSync,
    rmdirSync,
    Stats,
    unlink,
    WriteFileOptions,
    writeFileSync,
} from 'fs';
import { join, parse, ParsedPath } from 'path';

@Injectable()
export class FileService {
    /**
     * Writes a file to the file system given the path and body
     * @param {Object} obj - Object.
     * @param {string} obj.path - File path.
     * @param {string} obj.content - File contents.
     */
    writeFile({ path, content, flag }: { path: string; content: string; flag?: WriteFileOptions }) {
        if (!this.fileExists({ path })) writeFileSync(path, content, flag);
    }

    /**
     * Creates a directory for given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Directory path.
     */
    makeDirectory({ path }: { path: string; flag?: MakeDirectoryOptions }) {
        mkdirSync(path, { recursive: true });
    }

    /**
     * Reads and returns a JSON file.
     * @param {Object} obj - Object.
     * @param {string} obj.path - File path.
     * @return {string} file.
     */
    readJSONFile({ path }: { path: string }): string {
        return JSON.parse(readFileSync(path, 'utf8'));
    }

    /**
     * Returns an integer representing the file descriptor.
     * @param {Object} obj - Object.
     * @param {string} obj.path - File path.
     * @param {string} obj.flags - File flags.
     * @return {number} descriptor.
     */
    openFile({ path, flags }: { path: string; flags: string }): number {
        return openSync(path, flags);
    }

    /**
     * Checks if a file exists given its path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - File path.
     * @return {boolean} file exists or not.
     */
    fileExists({ path }: { path: string }): boolean {
        return existsSync(path);
    }

    /**
     * Moves a file from to given path.
     * @param {Object} obj - Object.
     * @param {string} obj.from - Path to move file from.
     * @param {string} obj.to - Path to move file to.
     * @return {boolean} success or not.
     */
    moveFile({ from, to }: { from: string; to: string }): boolean {
        if (!from || !to) throw new BadRequestException('please specify a from and a to path to move the file to');
        if (!this.fileExists({ path: from })) throw new BadRequestException('file does not exist');
        copyFile(from, to, err => {
            if (err) throw err;
        });
        this.deleteFile({ path: from });
        return true;
    }

    /**
     * Deletes a file by given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to delete file from.
     * @return {boolean} success or not.
     */
    deleteFile({ path }: { path: string }): boolean {
        if (!this.fileExists({ path })) throw new BadRequestException('unable to delete file, path does not exist');
        unlink(path, err => {
            if (err) throw err;
        });
        return true;
    }

    /**
     * Deletes a directory by given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to delete directory from.
     * @return {boolean} success or not.
     */
    deleteDirectory({ path }: { path: string }): boolean {
        if (!this.fileExists({ path })) throw new BadRequestException('unable to delete folder, path does not exist');
        rmdirSync(path, { recursive: true });
        return true;
    }

    /**
     * Clears the contents of a directory.
     * @param {Object} obj - Object.
     * @param {string} obj.dir - Directory path.
     * @return {boolean} directory cleared or not.
     */
    clearFolder({ dir }: { dir: string }): boolean {
        readdir(dir, (err, files) => {
            if (err) throw err;

            files.forEach(file => {
                unlink(join(dir, file), err => {
                    if (err) throw err;
                });
            });
        });
        return true;
    }

    /**
     * Get stats of given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path.
     * @return {Stats} stats.
     */
    getStats({ path }: { path: string }): Promise<Stats> {
        if (!this.fileExists({ path })) throw new BadRequestException('unable to get stats, path does not exist');
        return promises.lstat(path);
    }

    /**
     * Gets details corresponding to given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path.
     * @return {ParsedPath} parsed path.
     */
    getPathDetails({ path }: { path: string }): ParsedPath {
        if (!this.fileExists({ path }))
            throw new BadRequestException('unable to get path details, path does not exist');
        return parse(path);
    }

    /**
     * Reads and returns contents of a directory.
     * @param {Object} obj - Object.
     * @param {string} obj.dir - Directory path.
     * @param {string} obj.options - Read options.
     * @return {Dirent[]} contents.
     */
    async readDirectory({
        path,
        options,
    }: {
        path: string;
        options?: ObjectEncodingOptions & {
            withFileTypes: true;
        };
    }): Promise<Dirent[]> {
        return await promises.readdir(path, options);
    }
}
