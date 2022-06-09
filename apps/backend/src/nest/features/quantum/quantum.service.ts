import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';

import { PathInfoDTO } from '../file/dtos/path-info.dto';
import { FileService } from '../file/file.service';
import { RenameFileDTO } from './dtos/rename-file.dto';

@Injectable()
export class QuantumService {
    constructor(private readonly _fileService: FileService) {}

    /**
     * Get the contents of a directory by given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the directory.
     * @return {PathInfoDTO[]} - PathInfoDTO[].
     */
    async getDirectoryContent({ path }: { path: string }): Promise<PathInfoDTO[]> {
        try {
            const stats = await this._fileService.getStats({ path });
            if (!stats.isDirectory()) throw new BadRequestException('path is not a directory');
            const contents = await this._fileService.readDirectory({
                path,
                options: { withFileTypes: true },
            });

            return Promise.all(
                contents.map(async file => {
                    if (file.isBlockDevice() || file.isCharacterDevice() || file.isSymbolicLink() || file.isSocket())
                        return;
                    return await this.formatFileDetails({ path: join(path, file.name) });
                })
            );
        } catch (error) {
            throw new BadRequestException(`unable to get directory content: ${error}`);
        }
    }

    /**
     * Get directory stats.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the directory.
     * @return {PathInfoDTO[]} - PathInfoDTO[].
     */
    async getDirectoryInfo({ path }: { path: string }): Promise<PathInfoDTO> {
        try {
            const stats = await this._fileService.getStats({ path });
            if (!stats.isDirectory()) throw new BadRequestException('path is not a directory');

            return await this.formatFileDetails({ path });
        } catch (error) {
            throw new BadRequestException(`unable to get directory info: ${error}`);
        }
    }

    /**
     * Deletes a file or directory.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the file or directory.
     * @return {boolean} - True if the file or directory was deleted.
     */
    async deleteFileOrDirectory({ path }: { path: string }): Promise<boolean> {
        // TODO: remove share
        try {
            const stats = await this._fileService.getStats({ path });
            if (stats.isDirectory()) return this._fileService.deleteDirectory({ path });
            return this._fileService.deleteFile({ path });
        } catch (error) {
            throw new BadRequestException(`unable to get delete file or folder: ${error}`);
        }
    }

    /**
     * Creates a directory.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the directory.
     * @return {PathInfoDTO} - PathInfoDTO.
     */
    async createDirectoryWithRetry({ path, count = 0 }: { path: string; count?: number }): Promise<PathInfoDTO> {
        const pathWithCount = count === 0 ? path : `${path} (${count})`;
        if (this._fileService.exists({ path: pathWithCount }))
            return await this.createDirectoryWithRetry({ path, count: count + 1 });

        this._fileService.makeDirectory({ path: pathWithCount });
        return await this.formatFileDetails({ path: pathWithCount });
    }

    /**
     * Creates a file.
     * @param {Object} obj - Object.
     * @param {string} obj.fromPath - From path.
     * @param {string} obj.toPath - To path.
     * @param {string} obj.name - Name.
     */
    createFileWithRetry({
        fromPath,
        toPath,
        name,
        count = 0,
    }: {
        fromPath: string;
        toPath: string;
        name: string;
        count?: number;
    }): void {
        const path = join(toPath, name);
        const pathWithCount = count === 0 ? path : `${path.insert(path.lastIndexOf('.'), ` (${count})`)}`;
        if (this._fileService.exists({ path: pathWithCount }))
            return this.createFileWithRetry({ fromPath, toPath, name, count: count + 1 });

        this._fileService.moveFile({ from: fromPath, to: pathWithCount });
    }

    /**
     * Renames a file or directory.
     * @param {Object} obj - Object.
     * @param {string} obj.from - Path to rename from.
     * @param {string} obj.to - Path to rename to.
     */
    async renameFileOrDirectory({ from, to }: RenameFileDTO): Promise<void> {
        // TODO: handle shares
        if (!this._fileService.exists({ path: from }))
            throw new BadRequestException('unable to rename file, file does not exist');
        if (this._fileService.exists({ path: to }))
            throw new BadRequestException('unable to rename file, file with that name already exists');

        return await this._fileService.rename({ from, to });
    }

    /**
     * Search in folder and subfolders.
     * @param {Object} obj - Object.
     * @param {string} obj.search - Search term.
     * @param {string} obj.dir - Path to the directory.
     * @return {PathInfoDTO[]} - PathInfoDTO[].
     */
    async search({
        search,
        dir,
        files = [],
    }: {
        search: string;
        dir: string;
        files?: PathInfoDTO[];
    }): Promise<PathInfoDTO[]> {
        const contents = await this.getDirectoryContent({ path: dir });
        for (const file of contents) {
            files.push(file);
            const stats = await this._fileService.getStats({ path: join(dir, file.fullName) });
            if (stats.isDirectory()) files = await this.search({ search, dir: join(dir, file.fullName), files });
        }
        return files.filter(content => content.fullName.toLowerCase().includes(search.toLowerCase()));
    }

    /**
     * Formats the file details to be returned to the client.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the file.
     * @return {PathInfoDTO} - PathInfoDTO.
     */
    private async formatFileDetails({ path }: { path: string }): Promise<PathInfoDTO> {
        try {
            const stats = await this._fileService.getStats({ path });
            const details = this._fileService.getPathDetails({ path });
            const extension = details.ext.replace(/\./g, '');
            const directory = details.dir;

            return {
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                directory,
                path,
                fullName: details.base,
                name: details.name,
                extension,
                size: stats.size,
                createdOn: stats.ctime,
                lastModified: stats.mtime,
                lastAccessed: stats.atime,
            };
        } catch (error) {
            throw new BadRequestException(`unable to get file details: ${error}`);
        }
    }
}
