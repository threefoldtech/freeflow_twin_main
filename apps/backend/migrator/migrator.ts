import fs from 'fs';
import { config } from '../src/config/config';
import PATH from 'path';

const migrationsFolder = PATH.join(__dirname, '..', 'migrations');
const migrationName = /^\d{8}_*.+\.js$/gm;
const migrationsConfigPath = PATH.join(config.baseDir, 'migrations.json');

interface IMigration {
    name: string;
    executedOn: Date;
}

const getMigrations = (): IMigration[] => {
    if (!fs.existsSync(migrationsConfigPath)) return [];

    const raw = fs.readFileSync(migrationsConfigPath, 'utf8');
    return JSON.parse(raw) as IMigration[];
};

const persistMigrations = (data: IMigration[]): void => {
    fs.writeFileSync(migrationsConfigPath, JSON.stringify(data, null, 2), 'utf-8');
};

(async () => {
    const files = fs.readdirSync(migrationsFolder).sort();
    const migrations = getMigrations();
    for (const file of files) {
        if (!file.match(migrationName)) continue;

        const migration = await import(PATH.join(migrationsFolder, file));
        if (migration.up === undefined || migration.down === undefined)
            throw new Error(`Migration ${file} does not contain an 'up' or a 'down' function`);

        const index = migrations.findIndex(x => x.name === file);
        if (index !== -1) return;

        console.log(`Migration: ${file}`);
        try {
            console.log(`Migration started`);
            await migration.up();
            migrations.push({
                name: file,
                executedOn: new Date(),
            } as IMigration);
            console.log(`Migration finished`);
        } catch (ex) {
            console.log(`Migration Failed`);
            try {
                console.log(`Rolling back`);
                migration.down();
                console.log(`Rollback successful`);
            } catch (e) {
                console.log(`Rollback failed`);
                throw e;
            }
            throw ex;
        } finally {
            persistMigrations(migrations);
        }
    }
})();
