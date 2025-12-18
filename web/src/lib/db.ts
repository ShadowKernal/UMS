import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ROLE_ADMIN, ROLE_SUPER_ADMIN, ROLE_USER, USER_STATUS_ACTIVE } from "./constants";
import { nowTs } from "./time";
import { normalizeEmail, passwordHashSync } from "./security";
import { mailConfigured, sendEmail } from "./mail";

const dbFile = path.join(process.cwd(), "data", "ums.sqlite3");
let db: Database.Database | null = null;

const ensureDataDir = () => {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const migrate = (conn: Database.Database) => {
  conn.exec(
    `
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      email_norm TEXT NOT NULL UNIQUE,
      email_verified_at INTEGER,
      password_hash TEXT,
      status TEXT NOT NULL,
      display_name TEXT NOT NULL,
      locale TEXT,
      timezone TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_login_at INTEGER,
      deleted_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_name TEXT NOT NULL,
      assigned_by_user_id TEXT,
      assigned_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, role_name),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      csrf_token TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      revoked_at INTEGER,
      ip TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roles (
      name TEXT PRIMARY KEY,
      description TEXT,
      permissions_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      added_at INTEGER NOT NULL,
      PRIMARY KEY (group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      requested_from_ip TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      actor_user_id TEXT,
      target_user_id TEXT,
      ip TEXT,
      created_at INTEGER NOT NULL,
      metadata_json TEXT
    );

    CREATE TABLE IF NOT EXISTS dev_outbox (
      id TEXT PRIMARY KEY,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `
  );
};

export const getDb = () => {
  if (db) return db;
  ensureDataDir();
  db = new Database(dbFile);
  migrate(db);
  seedDefaultRoles(db);
  seedAdminIfEmpty(db);
  return db;
};

export const newId = () => uuidv4();

export const userRoles = (conn: Database.Database, userId: string) => {
  const rows = conn
    .prepare("SELECT role_name FROM user_roles WHERE user_id = ? ORDER BY role_name ASC")
    .all(userId) as { role_name: string }[];
  return rows.map((r) => r.role_name);
};

export const hasRole = (conn: Database.Database, userId: string, role: string) => {
  const row = conn.prepare("SELECT 1 FROM user_roles WHERE user_id = ? AND role_name = ?").get(userId, role);
  return Boolean(row);
};

export const auditLog = (
  conn: Database.Database,
  {
    action,
    actorUserId,
    targetUserId,
    ip,
    metadata
  }: { action: string; actorUserId?: string | null; targetUserId?: string | null; ip?: string | null; metadata?: Record<string, unknown> }
) => {
  conn
    .prepare(
      "INSERT INTO audit_logs (id, action, actor_user_id, target_user_id, ip, created_at, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(newId(), action, actorUserId ?? null, targetUserId ?? null, ip ?? null, nowTs(), JSON.stringify(metadata || {}));
};

export const sendDevEmail = (
  conn: Database.Database,
  { toEmail, subject, body }: { toEmail: string; subject: string; body: string }
) => {
  if (mailConfigured()) {
    // Best-effort real email send; keep dev_outbox insert for local visibility.
    sendEmail({ to: toEmail, subject, text: body }).catch((err) => {
      console.error("SMTP send failed", err);
    });
  }
  conn
    .prepare("INSERT INTO dev_outbox (id, to_email, subject, body, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(newId(), toEmail, subject, body, nowTs());
};

const seedAdminIfEmpty = (conn: Database.Database) => {
  const anyUser = conn.prepare("SELECT 1 FROM users LIMIT 1").get();
  if (anyUser) return;

  const adminEmail = "admin@example.com";
  const adminPassword = passwordHashSync("admin123!");
  const userId = newId();
  const ts = nowTs();

  conn
    .prepare(
      "INSERT INTO users (id, email, email_norm, email_verified_at, password_hash, status, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(userId, adminEmail, normalizeEmail(adminEmail), ts, adminPassword, USER_STATUS_ACTIVE, "Admin", ts, ts);

  const roleStmt = conn.prepare(
    "INSERT INTO user_roles (user_id, role_name, assigned_by_user_id, assigned_at) VALUES (?, ?, NULL, ?)"
  );
  roleStmt.run(userId, ROLE_ADMIN, ts);
  roleStmt.run(userId, ROLE_USER, ts);

  sendDevEmail(conn, {
    toEmail: adminEmail,
    subject: "UMS demo admin credentials",
    body: `Admin account created:\n\nEmail: ${adminEmail}\nPassword: admin123!\n\nLogin: http://localhost:3000/login\n`
  });
};

const seedDefaultRoles = (conn: Database.Database) => {
  const existing = conn.prepare("SELECT name FROM roles").all() as { name: string }[];
  const have = new Set(existing.map((r) => r.name));
  const ts = nowTs();

  const defaults = [
    { name: ROLE_USER, description: "Standard user access", permissions: ["read_self", "update_self"] },
    { name: ROLE_ADMIN, description: "Admin access", permissions: ["manage_users", "manage_roles", "view_audit_logs"] },
    { name: ROLE_SUPER_ADMIN, description: "Super admin access", permissions: ["all_access"] }
  ];

  const stmt =
    conn.prepare("INSERT OR IGNORE INTO roles (name, description, permissions_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)");
  defaults.forEach((role) => {
    if (have.has(role.name)) return;
    stmt.run(role.name, role.description, JSON.stringify(role.permissions), ts, ts);
  });
};
