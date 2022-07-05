# Jimber Skeleton Backend

## Run dev server:

```bash
yarn dev
```

## Build to dist folder:

```bash
yarn build
```

## Migrations

[Documentation on TypeORM migrations](https://github.com/typeorm/typeorm/blob/master/docs/migrations.md)  
In the ormconfig.json, there is a property "synchronize". This property should only be true in DEVELOPMENT environment.
This causes your Entity structure to be synchronized with the database. Doing this on a production environment could cause data loss!

### Generating migrations

```bash
typeorm migration:generate -n <name>
```

Generating migrations is also only possible if the synchronize property is on false. Using the migrations generate command will cause TypeORM to check the difference between your entities and the database.

Build the migration with:

```bash
yarn build
```

Run the migration afterwards with:

```bash
typeorm migration:run
```

### Routes

Generate routes.ts

```bash
yarn routes
```

### Swagger

Generate

```bash
yarn swagger
```
