import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { PathInfoDTO } from '../file/dtos/path-info.dto';
import { FileService } from '../file/file.service';

@Injectable()
export class QuantumService {
    private storageDir = '';

    constructor(private readonly _configService: ConfigService, private readonly _fileService: FileService) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    /**
     * Get the contents of a directory by given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the directory.
     * @returns {PathInfoDTO[]} - PathInfoDTO[].
     */
    async getDirectoryContent({ path }: { path: string }): Promise<PathInfoDTO[]> {
        try {
            const actualPath = path === '/' ? this.storageDir : path;
            const stats = await this._fileService.getStats({ path: actualPath });
            if (!stats.isDirectory()) throw new BadRequestException('path is not a directory');
            const contents = await this._fileService.readDirectory({
                path: actualPath,
                options: { withFileTypes: true },
            });

            return Promise.all(
                contents.map(async file => {
                    if (file.isBlockDevice() || file.isCharacterDevice() || file.isSymbolicLink() || file.isSocket())
                        return;
                    return await this.formatFileDetails({ path: join(actualPath, file.name) });
                })
            );
        } catch (error) {
            throw new BadRequestException(`unable to get directory content: ${error}`);
        }
    }

    /**
     * Formats the file details to be returned to the client.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the file.
     * @returns {PathInfoDTO} - PathInfoDTO.
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
