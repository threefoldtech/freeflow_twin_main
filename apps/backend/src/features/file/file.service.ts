import { BadRequestException, Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
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
    readdirSync,
    readFileSync,
    rmdirSync,
    Stats,
    unlink,
    WriteFileOptions,
    writeFileSync,
} from 'fs';
import { join, parse, ParsedPath } from 'path';
import { ReadableStreamBuffer } from 'stream-buffers';

import { RenameFileDTO } from '../quantum/dtos/rename-file.dto';
import { cp, move } from 'fs-extra';

@Injectable()
export class FileService {
    /**
     * Writes a file to the file system given the path and body
     * @param {Object} obj - Object.
     * @param {string} obj.path - File path.
     * @param {string} obj.content - File contents.
     */
    writeFile({ path, content, flag }: { path: string; content: string | Buffer; flag?: WriteFileOptions }) {
        writeFileSync(path, content, flag);
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
     * Checks if a path exists.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path.
     * @return {boolean} path exists or not.
     */
    exists({ path }: { path: string }): boolean {
        return existsSync(path);
    }

    readFile({ path }: { path: string }): Buffer {
        if (!this.exists({ path })) throw new BadRequestException('file does not exist');
        return readFileSync(path);
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
        if (!this.exists({ path: from })) throw new BadRequestException('file does not exist');
        move(from, to, { overwrite: true }, err => {
            if (err) throw err;
        });
        return true;
    }

    /**
     * Copies a file from to given path.
     * @param {Object} obj - Object.
     * @param {string} obj.from - Path to copy file from.
     * @param {string} obj.to - Path to copy file to.
     * @return {boolean} success or not.
     */
    copyFile({ from, to }: { from: string; to: string }): boolean {
        if (!from || !to) throw new BadRequestException('please specify a from and a to path to copy the file to');
        if (!this.exists({ path: from })) throw new BadRequestException('file does not exist');
        const isDirectory = !from.split('/').pop().includes('.');
        cp(from, to, { recursive: isDirectory }, err => {
            if (err) throw err;
        });
        return true;
    }

    /**
     * Deletes a file by given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to delete file from.
     * @return {boolean} success or not.
     */
    deleteFile({ path }: { path: string }): boolean {
        if (!this.exists({ path })) throw new BadRequestException('unable to delete file, path does not exist');
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
        if (!this.exists({ path })) throw new BadRequestException('unable to delete folder, path does not exist');
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
    async getStats({ path }: { path: string }): Promise<Stats> {
        if (!this.exists({ path })) throw new BadRequestException('unable to get stats, path does not exist');
        return await promises.lstat(path);
    }

    /**
     * Gets details corresponding to given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path.
     * @return {ParsedPath} parsed path.
     */
    getPathDetails({ path }: { path: string }): ParsedPath {
        if (!this.exists({ path })) throw new BadRequestException('unable to get path details, path does not exist');
        return parse(path);
    }

    /**
     * Renames a file or directory.
     * @param {Object} obj - Object.
     * @param {string} obj.from - Path to rename from.
     * @param {string} obj.to - Path to rename to.
     */
    async rename({ from, to }: RenameFileDTO): Promise<void> {
        return await promises.rename(from, to);
    }

    /**
     * Compresses files given their paths.
     * @param {Object} obj - Object.
     * @param {string} obj.paths - Paths to compress.
     * @return {AdmZip} compressed files in zip.
     */
    compressFiles({ paths }: { paths: string[] }): AdmZip {
        const zip = new AdmZip();
        paths.forEach(path => {
            zip.addLocalFile(path);
        });
        return zip;
    }

    /**
     * Reads a directory and returns an array of file names.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path.
     * @return {string[]} file names.
     */
    readdirSync({ path }: { path: string }): string[] {
        return readdirSync(path);
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

    async getFileStream({ file }: { file: Buffer }): Promise<ReadableStreamBuffer> {
        const decryptedStreamBuffer = new ReadableStreamBuffer({
            frequency: 10,
            // 512 kb
            chunkSize: 512 * 1024,
        });
        decryptedStreamBuffer.put(file);
        decryptedStreamBuffer.stop();
        return decryptedStreamBuffer;
    }

    isFolder(path: string) {
        return !path.split('/').pop().includes('.');
    }
}
