import { Pool, type PoolClient } from "@neondatabase/serverless";
import { v4 as uuidv4 } from "uuid";
import { nowTs } from "./time";
import { mailConfigured, sendEmail } from "./mail";

export const dbEnabled = process.env.PREPMASTER_ENABLE_DB === "true";

type Statement = {
  get: (...args: unknown[]) => Promise<unknown>;
  all: (...args: unknown[]) => Promise<unknown[]>;
  run: (...args: unknown[]) => Promise<{ changes: number; lastInsertRowid: number }>;
};

export type DbConnection = {
  prepare: (sql: string) => Statement;
  exec: (sql: string) => Promise<void>;
  transaction: <T>(fn: (tx: DbConnection) => Promise<T>) => () => Promise<T>;
};

const connectionString = process.env.DATABASE_URL || "";
const pool = connectionString ? new Pool({ connectionString }) : null;

const toPgQuery = (sqlText: string, params: unknown[]) => {
  let index = 0;
  const text = sqlText.replace(/\?/g, () => `$${++index}`);
  return { text, values: params };
};

const createDbConnection = (client?: PoolClient): DbConnection => ({
  prepare: (sqlText: string) => ({
    get: async (...args: unknown[]) => {
      const { text, values } = toPgQuery(sqlText, args);
      const result = await (client ? client.query(text, values) : pool!.query(text, values));
      return result.rows[0];
    },
    all: async (...args: unknown[]) => {
      const { text, values } = toPgQuery(sqlText, args);
      const result = await (client ? client.query(text, values) : pool!.query(text, values));
      return result.rows;
    },
    run: async (...args: unknown[]) => {
      const { text, values } = toPgQuery(sqlText, args);
      const result = await (client ? client.query(text, values) : pool!.query(text, values));
      return { changes: result.rowCount || 0, lastInsertRowid: 0 };
    }
  }),
  exec: async (sqlText: string) => {
    await (client ? client.query(sqlText) : pool!.query(sqlText));
  },
  transaction: <T>(fn: (tx: DbConnection) => Promise<T>) => async () => {
    if (!pool) {
      throw new Error("DATABASE_URL is not configured.");
    }
    const txClient = await pool.connect();
    try {
      await txClient.query("BEGIN");
      const txConn = createDbConnection(txClient);
      const result = await fn(txConn);
      await txClient.query("COMMIT");
      return result;
    } catch (err) {
      await txClient.query("ROLLBACK");
      throw err;
    } finally {
      txClient.release();
    }
  }
});

const noopStatement: Statement = {
  get: async () => undefined,
  all: async () => [],
  run: async () => ({ changes: 0, lastInsertRowid: 0 })
};

const noopDb: DbConnection = {
  prepare: () => noopStatement,
  exec: async () => undefined,
  transaction: (fn) => async () => fn(noopDb)
};

export const getDb = (): DbConnection => {
  if (!dbEnabled) return noopDb;
  if (!pool) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return createDbConnection();
};

export const newId = () => uuidv4();

export const userRoles = async (conn: DbConnection, userId: string) => {
  const rows = (await conn
    .prepare("SELECT role_name FROM user_roles WHERE user_id = ? ORDER BY role_name ASC")
    .all(userId)) as { role_name: string }[];
  return rows.map((r) => r.role_name);
};

export const hasRole = async (conn: DbConnection, userId: string, role: string) => {
  const row = await conn.prepare("SELECT 1 FROM user_roles WHERE user_id = ? AND role_name = ?").get(userId, role);
  return Boolean(row);
};

export const auditLog = async (
  conn: DbConnection,
  {
    action,
    actorUserId,
    targetUserId,
    ip,
    metadata
  }: { action: string; actorUserId?: string | null; targetUserId?: string | null; ip?: string | null; metadata?: Record<string, unknown> }
) => {
  await conn
    .prepare(
      "INSERT INTO audit_logs (id, action, actor_user_id, target_user_id, ip, created_at, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(newId(), action, actorUserId ?? null, targetUserId ?? null, ip ?? null, nowTs(), JSON.stringify(metadata || {}));
};

export const sendDevEmail = async (
  conn: DbConnection,
  { toEmail, subject, body }: { toEmail: string; subject: string; body: string }
) => {
  if (mailConfigured()) {
    sendEmail({ to: toEmail, subject, text: body }).catch((err) => {
      console.error("SMTP send failed", err);
    });
  }
  await conn
    .prepare("INSERT INTO dev_outbox (id, to_email, subject, body, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(newId(), toEmail, subject, body, nowTs());
};
