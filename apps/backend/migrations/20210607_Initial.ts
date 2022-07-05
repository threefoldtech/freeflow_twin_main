import fs from 'fs';
import PATH from 'path';
import { config } from '../src/config/config';
const path = PATH.join(config.baseDir, 'migrations.json');

export const up = () => {
    if (fs.existsSync(path)) return;
    fs.writeFileSync(path, Buffer.from([]));
};

export const down = () => {
    if (!fs.existsSync(path)) return;
    fs.rmSync(path);
};
