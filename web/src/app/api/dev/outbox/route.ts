import { handleApi } from "@/lib/route-helpers";
import { jsonResponse } from "@/lib/http";
import { getDb } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    const conn = getDb();
    interface OutboxItem {
      id: string;
      to_email: string;
      subject: string;
      body: string;
      created_at: number;
    }

    const items = (await conn
      .prepare("SELECT id, to_email, subject, body, created_at FROM dev_outbox ORDER BY created_at DESC LIMIT 50")
      .all()) as OutboxItem[];
    return jsonResponse(200, { messages: items });
  });
}
