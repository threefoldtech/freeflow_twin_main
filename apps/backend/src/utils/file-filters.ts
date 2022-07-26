import { BadRequestException } from '@nestjs/common';

/**
 * Helper function for NestJS FileInterceptor.
 * Checks if uploaded file has a mimetype of image.
 * @param {File} file - Original uploaded express multer file.
 * @param {Function} callback - Callback function.
 */
export function imageFileFilter(
    _: unknown,
    file: Express.Multer.File,
    callback: (error: Error, accepted: boolean) => void
): void {
    if (!file.mimetype.includes('image')) {
        return callback(new BadRequestException('provide a valid image'), false);
    }
    callback(null, true);
}
