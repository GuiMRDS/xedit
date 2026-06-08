import { runner as migrationRunner } from "node-pg-migrate";
import path from "node:path";

import database from "infra/database";
import { MigrationsErrorServices } from "infra/errors.js";

const defaultMigrationsOptions = {
  dryRun: true,
  dir: path.join(process.cwd(), "infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });
    return pendingMigrations;
  } catch (error) {
    throw new MigrationsErrorServices({
      message: "Erro ao listar migrações pentedes.",
      cause: error,
    });
  } finally {
    if (dbClient) {
      await dbClient?.end();
    }
  }
}

async function runPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
      dryRun: false,
    });

    return migratedMigrations;
  } catch (error) {
    throw new MigrationsErrorServices({
      message: "Erro ao iniciar migrações pendentes.",
      cause: error,
    });
  } finally {
    if (dbClient) {
      await dbClient?.end();
    }
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
