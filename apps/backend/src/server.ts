import './utils/extensions';

import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import express, { Application } from 'express';
import fileupload from 'express-fileupload';
import session from 'express-session';
import http from 'http';
import morgan from 'morgan';

import { initAll } from './index';
import { httpLogger } from './logger';
import errorMiddleware from './middlewares/errorHandlingMiddleware';
import bootstrapNest from './nest/main';
import mountNestApp from './nest/utils/mount-nest';
import routes from './routes';
import { startSocketIo } from './service/socketService';

const PORT = process.env.PORT ?? 3000;

const corsOptions: CorsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};

const app: Application = express();
const httpServer: http.Server = http.createServer(app);

startSocketIo(httpServer);

app.use(
    morgan('short', {
        stream: {
            write: (text: string) => {
                httpLogger.http(text);
            },
        },
    })
);
app.use(errorMiddleware);

app.use(cors(corsOptions));

// app.enable('trust proxy');
app.set('trust proxy', 1);

app.use(
    session({
        name: 'sessionId',
        secret: 'secretpassphrase',
        resave: false,
        saveUninitialized: false,
        proxy: true,
        cookie: {
            path: '/',
            httpOnly: false,
            secure: false,
        },
    })
);

app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));
app.use(bodyParser.json({ limit: '100mb' }));

app.use(
    fileupload({
        useTempFiles: true,
        parseNested: true,
    })
);

app.use('/api/v1', routes);

initAll();

httpServer.listen(PORT, () => {
    console.log(`express server started on port ${PORT}`);
});

mountNestApp({ mountPath: '/api/v2', bootstrapNest });
