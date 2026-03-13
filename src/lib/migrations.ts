import Database from 'better-sqlite3';

export interface Migration {
  version: number;
  name: string;
  up: (db: Database) => void;
  down: (db: Database) => void;
}

export interface AppliedMigration {
  version: number;
  name: string;
  applied_at: string | null;
}

/**
 * Create the schema_migrations tracking table if it doesn't exist
 */
function createMigrationTable(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get list of applied migrations from the database
 */
export function getAppliedMigrations(db: Database): AppliedMigration[] {
  try {
    const rows = db.prepare(
      'SELECT version, name, applied_at FROM schema_migrations ORDER BY version'
    ).all() as AppliedMigration[];
    return rows;
  } catch (e) {
    // Table doesn't exist yet
    return [];
  }
}

/**
 * Get pending migrations that haven't been applied yet
 */
export function getPendingMigrations(
  db: Database,
  availableMigrations: Migration[]
): Migration[] {
  const applied = getAppliedMigrations(db);
  const appliedVersions = new Set(applied.map(m => m.version));

  return availableMigrations
    .filter(m => !appliedVersions.has(m.version))
    .sort((a, b) => a.version - b.version);
}

/**
 * Run a single migration in a transaction
 */
function runMigration(db: Database, migration: Migration): void {
  const transaction = db.transaction(() => {
    // Run the up migration
    migration.up(db);

    // Record the migration
    db.prepare(
      'INSERT INTO schema_migrations (version, name) VALUES (?, ?)'
    ).run(migration.version, migration.name);
  });

  transaction();
}

/**
 * Rollback a single migration in a transaction
 */
function rollbackMigration(db: Database, migration: Migration): void {
  const transaction = db.transaction(() => {
    // Run the down migration
    migration.down(db);

    // Remove the migration record
    db.prepare(
      'DELETE FROM schema_migrations WHERE version = ?'
    ).run(migration.version);
  });

  transaction();
}

/**
 * Run all pending migrations
 */
export function runMigrations(db: Database, migrations: Migration[]): void {
  // Ensure migration table exists
  createMigrationTable(db);

  // Get pending migrations
  const pending = getPendingMigrations(db, migrations);

  if (pending.length === 0) {
    return;
  }

  // Run each pending migration
  for (const migration of pending) {
    runMigration(db, migration);
  }
}

/**
 * Rollback the most recently applied migration
 */
export function rollbackLastMigration(
  db: Database,
  migrations: Migration[]
): Migration | null {
  const applied = getAppliedMigrations(db);

  if (applied.length === 0) {
    return null;
  }

  // Get the most recently applied migration
  const lastApplied = applied[applied.length - 1];
  const migration = migrations.find(m => m.version === lastApplied.version);

  if (!migration) {
    throw new Error(
      `Migration version ${lastApplied.version} not found in available migrations`
    );
  }

  rollbackMigration(db, migration);
  return migration;
}

/**
 * Get migration status summary
 */
export function getMigrationStatus(
  db: Database,
  migrations: Migration[]
): {
  current: number;
  applied: AppliedMigration[];
  pending: Migration[];
} {
  const applied = getAppliedMigrations(db);
  const pending = getPendingMigrations(db, migrations);
  const current = applied.length > 0 ? applied[applied.length - 1].version : 0;

  return {
    current,
    applied,
    pending,
  };
}
