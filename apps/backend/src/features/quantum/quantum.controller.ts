import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Post,
    Put,
    Query,
    StreamableFile,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { join } from 'path';
import syncRequest from 'sync-request';

import { AuthGuard } from '../../guards/auth.guard';
import { CreateDirectoryDTO } from '../file/dtos/directory.dto';
import { DirectoryInfoDTO } from '../file/dtos/directory-info.dto';
import { PathInfoDTO } from '../file/dtos/path-info.dto';
import { MoveFileDTO } from './dtos/move-file.dto';
import { RenameFileDTO } from './dtos/rename-file.dto';
import { ShareFileRequesDTO } from './dtos/share-file.dto';
import { SharePermissionType } from './enums/share-permission-type.enum';
import { IFileShare } from './interfaces/file-share.interface';
import { IOnlyOfficeResponse } from './interfaces/only-office-reponse.interface';
import { QuantumService } from './quantum.service';

@Controller('quantum')
export class QuantumController {
    private storageDir = '';

    constructor(private readonly _configService: ConfigService, private readonly _quantumService: QuantumService) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    @Get('dir/content')
    @UseGuards(AuthGuard)
    async getDirectoryContent(@Query('path') path: string): Promise<PathInfoDTO[]> {
        const actualPath = path === '/' ? this.storageDir : path;
        return await this._quantumService.getDirectoryContent({ path: actualPath });
    }

    @Get('dir/info')
    @UseGuards(AuthGuard)
    async getDirectoryInfo(@Query('path') path: string): Promise<PathInfoDTO> {
        const actualPath = path === '/' ? this.storageDir : path;
        return await this._quantumService.getDirectoryInfo({ path: actualPath });
    }

    @Get('file/info')
    @UseGuards(AuthGuard)
    async getFileInfo(@Query() params: { path: string; attachments: boolean }) {
        const { path } = params;
        // const parsedParams = Buffer.from(JSON.stringify(params), 'base64').toString('utf8');
        // const paramsObj = JSON.parse(parsedParams);

        // console.log(paramsObj);

        // let actualPath = path;
        // if (params) {
        //     const { shareId, token } = paramsObj as { shareId: string; token: string };
        //     const payload = await this._quantumService.verifyQuantumJWT({ token });
        //     if (payload.permissions.indexOf(SharePermissionType.READ) < 0)
        //         throw new UnauthorizedException(`you do not have the premission to read this file`);
        //     actualPath = await this._quantumService.getSharePath({ shareId });
        // }

        // actualPath = attachments ? join(actualPath, '/appdata/attachments') : actualPath;

        return {
            ...(await this._quantumService.getFileInfo({ path })),
            key: this._quantumService.getQuantumFileToken({ writable: true, path }),
            readToken: await this._quantumService.generateQuantumJWT({
                payload: { file: path, permissions: [SharePermissionType.READ] },
                exp: 5 * 60,
            }),
            writeToken: await this._quantumService.generateQuantumJWT({
                payload: { file: path, permissions: [SharePermissionType.WRITE] },
                exp: 24 * 60 * 60,
            }),
        };
    }

    @Get('file/internal')
    @UseGuards(AuthGuard)
    async getQuantumFile(@Query() { path, token }: { path: string; token: string }) {
        if (!token) throw new UnauthorizedException('no token provided');

        // TODO: handle blocked tokens

        const payload = await this._quantumService.verifyQuantumJWT({ token });
        if (payload.permissions.indexOf(SharePermissionType.READ) < 0 || payload.file !== path)
            throw new UnauthorizedException(`you do not have the premission to read this file`);

        // TODO: handle attachments

        return new StreamableFile(createReadStream(path));
    }

    @Post('file/internal')
    @UseGuards(AuthGuard)
    async editQuantumFile(@Body() onlyOfficeResponse: IOnlyOfficeResponse, @Query('token') token: string) {
        if (!token) throw new UnauthorizedException('no token provided');

        if (onlyOfficeResponse.status !== 2 && onlyOfficeResponse.status !== 6)
            return {
                error: 0,
            };

        // TODO: handle blocked tokens

        const payload = await this._quantumService.verifyQuantumJWT({ token });

        if (payload.permissions.indexOf(SharePermissionType.WRITE) < 0)
            throw new UnauthorizedException(`you do not have the premission to edit this file`);

        if (!payload.file || !onlyOfficeResponse?.url) throw new NotFoundException('no file or url provided');

        const url = new URL(onlyOfficeResponse.url);
        url.hostname = 'documentserver.digitaltwin-test.jimbertesting.be';
        url.protocol = 'https:';
        const fileResponse = syncRequest('GET', url);
        const fileBuffer = <Buffer>fileResponse.body;
        await this._quantumService.writeFile({ path: payload.file, file: fileBuffer });
        return {
            error: 0,
        };
    }

    @Get('search')
    @UseGuards(AuthGuard)
    async search(@Query('search') search: string, @Query('dir') dir: string): Promise<PathInfoDTO[]> {
        const path = dir === '/' ? this.storageDir : dir;
        return await this._quantumService.search({ search, dir: path });
    }

    @Get('share/info')
    @UseGuards(AuthGuard)
    async getShareFileAccessDetaisl(@Query() params: { shareId: string; userId: string; path: string }) {
        const { shareId, userId, path } = params;
        const share = await this._quantumService.getShareById({ id: shareId });
        const userPermissions = await this._quantumService.getSharePermissionsByUser({ shareId, userId });
        if (userPermissions.length < 1)
            throw new UnauthorizedException('you do not have the premission to read this file');

        let actualPath = share.path;
        if (path !== actualPath) actualPath = join(path, actualPath);

        const userCanWrite = !!userPermissions.find(x => x === SharePermissionType.WRITE);

        return {
            ...(await this._quantumService.getFileInfo({ path: actualPath })),
            key: this._quantumService.getQuantumFileToken({ writable: userCanWrite, path: actualPath }),
            readToken: await this._quantumService.generateQuantumJWT({
                payload: { file: actualPath, permissions: [SharePermissionType.READ] },
                exp: 5 * 60,
            }),
            writeToken: await this._quantumService.generateQuantumJWT({
                payload: { file: actualPath, permissions: [SharePermissionType.WRITE] },
                exp: 24 * 60 * 60,
            }),
        };
    }

    @Get('shares/shared-with-me')
    @UseGuards(AuthGuard)
    async getSharedWithMe(): Promise<IFileShare[]> {
        return await this._quantumService.getSharedWithMe();
    }

    @Get('share')
    @UseGuards(AuthGuard)
    async getShareById(@Query('id') id: string): Promise<IFileShare> {
        return (await this._quantumService.getShareById({ id })).toJSON();
    }

    @Get('share/path')
    @UseGuards(AuthGuard)
    async getShareByPath(@Query('path') path: string): Promise<IFileShare> {
        path = Buffer.from(path, 'base64').toString('binary');
        return (await this._quantumService.getShareByPath({ path })).toJSON();
    }

    @Post('share/permissions')
    @UseGuards(AuthGuard)
    async updateSharePermissions(@Body() { chatId, path }: { chatId: string; path: string }) {
        path = Buffer.from(path, 'base64').toString('binary');
        await this._quantumService.updateSharePermissions({ chatId, path });
    }

    @Post('dir')
    @UseGuards(AuthGuard)
    async createDirectory(@Body() { path, name }: CreateDirectoryDTO): Promise<DirectoryInfoDTO> {
        const actualPath = path === '/' ? join(this.storageDir, name) : join(path, name);
        const details = await this._quantumService.createDirectoryWithRetry({ path: actualPath });
        return {
            isFile: false,
            name: details.name,
            isDirectory: true,
        } as DirectoryInfoDTO;
    }

    @Post('move-files')
    @UseGuards(AuthGuard)
    moveFiles(@Body() { paths, destination }: MoveFileDTO): boolean {
        paths.map(path => {
            this._quantumService.createFileWithRetry({
                fromPath: path,
                toPath: destination,
                name: path.split('/').pop(),
            });
        });
        return true;
    }

    @Post('share')
    @UseGuards(AuthGuard)
    async shareFile(@Body() shareFileDTO: ShareFileRequesDTO) {
        return await this._quantumService.shareFile(shareFileDTO);
    }

    @Put('rename')
    @UseGuards(AuthGuard)
    async renameFileOrDirectory(@Body() { from, to }: RenameFileDTO): Promise<void> {
        const actualPath = to.includes('appdata') ? to : join(this.storageDir, to);
        return await this._quantumService.renameFileOrDirectory({ from, to: actualPath });
    }
}
