import { INestApplication } from '@nestjs/common';

/**
 * Mounts NestJS application to existing Express app.
 * @param {string} mountPath - API endpoint path.
 * @param {Function} bootstrapNest - Callback function that bootstraps the NestJS application.
 */
async function mountNestApp({
    mountPath,
    bootstrapNest,
}: {
    mountPath: string;
    bootstrapNest: { (): Promise<INestApplication> };
}): Promise<void> {
    const PORT = process.env.PORT ?? 3000;

    const nestApp = await bootstrapNest();
    nestApp.setGlobalPrefix(mountPath);
    nestApp.listen(+PORT + 1, () => {
        console.log(`nestjs server started on port ${+PORT + 1}`);
    });

    // await nestApp.init();
}

export default mountNestApp;
