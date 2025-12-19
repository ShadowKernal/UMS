import { v4 as uuidv4 } from "uuid";
import { nowTs } from "./time";
import { mailConfigured, sendEmail } from "./mail";

export const dbEnabled = process.env.PREPMASTER_ENABLE_DB === "true";

type Statement = {
  get: (...args: unknown[]) => unknown;
  all: (...args: unknown[]) => unknown[];
  run: (...args: unknown[]) => { changes: number; lastInsertRowid: number };
};

export type DbConnection = {
  prepare: (sql: string) => Statement;
  exec: (sql: string) => void;
  transaction: <T>(fn: () => T) => () => T;
};

const noopStatement: Statement = {
  get: () => undefined,
  all: () => [],
  run: () => ({ changes: 0, lastInsertRowid: 0 })
};

const noopDb: DbConnection = {
  prepare: () => noopStatement,
  exec: () => undefined,
  transaction: (fn) => () => fn()
};

export const getDb = (): DbConnection => {
  if (!dbEnabled) return noopDb;
  throw new Error("Database is disabled. Re-enable a DB driver before setting PREPMASTER_ENABLE_DB=true.");
};

export const newId = () => uuidv4();

export const userRoles = (conn: DbConnection, userId: string) => {
  const rows = conn
    .prepare("SELECT role_name FROM user_roles WHERE user_id = ? ORDER BY role_name ASC")
    .all(userId) as { role_name: string }[];
  return rows.map((r) => r.role_name);
};

export const hasRole = (conn: DbConnection, userId: string, role: string) => {
  const row = conn.prepare("SELECT 1 FROM user_roles WHERE user_id = ? AND role_name = ?").get(userId, role);
  return Boolean(row);
};

export const auditLog = (
  conn: DbConnection,
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
  conn: DbConnection,
  { toEmail, subject, body }: { toEmail: string; subject: string; body: string }
) => {
  if (mailConfigured()) {
    sendEmail({ to: toEmail, subject, text: body }).catch((err) => {
      console.error("SMTP send failed", err);
    });
  }
  conn
    .prepare("INSERT INTO dev_outbox (id, to_email, subject, body, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(newId(), toEmail, subject, body, nowTs());
};
