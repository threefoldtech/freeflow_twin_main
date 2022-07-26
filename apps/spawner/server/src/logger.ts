import { createLogger, format, transports } from 'winston';

// creates a new Winston Logger
export const logger = createLogger({
    level: 'info',
    transports: [
        new transports.Console({
            level: 'debug',
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
