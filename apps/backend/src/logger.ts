import { italic, underline, white } from 'chalk';
import { TransformableInfo } from 'logform';
import { createLogger, format, transports } from 'winston';

const getDetailsFromFile = (fileDetails: any) => {
    const fileAndRow = fileDetails.split('at ').pop().split('(').pop().replace(')', '').split(':');

    const detailsFromFile = {
        file: fileAndRow[0].trim(),
        line: fileAndRow[1],
        row: fileAndRow[2],
    };

    // @ts-ignore
    detailsFromFile.formattedInfos = white(
        Object.keys(detailsFromFile).reduce(
            (previous, key) =>
                // @ts-ignore
                `${previous}${underline(key)}: ${italic(detailsFromFile[key])}`,
            `\n`
        )
    );

    return detailsFromFile;
};

export const logger = createLogger({
    level: 'info',
    transports: [
        new transports.Console({
            handleExceptions: true,
            format: format.combine(
                format.colorize(),
                format.timestamp({
                    format: 'YY/MM/DD:HH:mm:ss:SSS',
                }),
                format.printf((info: TransformableInfo) => {
                    const detailsFromFile = getDetailsFromFile(new Error().stack);

                    // S'il y a un objet, on le formatte
                    const meta = info.meta && Object.keys(info.meta).length ? JSON.stringify(info.meta, null, 2) : '';

                    return `[${info.timestamp}] ${info.level}: ${info.message}${
                        info.splat !== undefined ? `${info.splat}` : ' '
                    }`;
                })
            ),
        }),
    ],
    exitOnError: false,
});
// creates a new Winston Logger
export const httpLogger = createLogger({
    level: 'info',
    transports: [
        new transports.Console({
            level: 'http',
            handleExceptions: true,
            format: format.combine(
                format.colorize(),
                format.timestamp({
                    format: 'YY/MM/DD:HH:mm:ss:SSS',
                }),
                format.printf(
                    (info: any) =>
                        `[${info.timestamp}] ${info.level}: ${info.message}` +
                        (info.splat !== undefined ? `${info.splat}` : ' ')
                )
            ),
        }),
        new transports.File({
            filename: './logs/error.log',
            level: 'error',
        }),
    ],
    exitOnError: false,
});
