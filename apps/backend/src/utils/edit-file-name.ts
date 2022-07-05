import { extname } from 'path';

/**
 * Helper function for NestJS FileInterceptor.
 * Transforms uploaded file name to random file name.
 * @param {File} file - Original uploaded express multer file.
 * @param {Function} callback - Callback function.
 */
export function editFileName(
    _: unknown,
    file: Express.Multer.File,
    callback: (error: Error, newFileName: string) => void
): void {
    const fileExtName = extname(file.originalname);

    const name = file.originalname.split('.')[0];
    const newRandomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

    callback(null, `${name}-${newRandomName}${fileExtName}`);
}
