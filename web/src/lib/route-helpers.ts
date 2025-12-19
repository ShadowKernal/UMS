import { NextRequest } from "next/server";
import { ApiError } from "./errors";
import { jsonResponse } from "./http";
import { dbEnabled } from "./db";

export const handleApi = async (req: NextRequest, fn: () => Promise<Response>) => {
  try {
    if (!dbEnabled) {
      return jsonResponse(503, { error: { code: "DB_DISABLED", message: "Database disabled" } });
    }
    return await fn();
  } catch (err) {
    if (err instanceof ApiError) {
      return jsonResponse(err.status, { error: { code: err.code, message: err.message } });
    }
    console.error("Unhandled API error", err);
    return jsonResponse(500, { error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
  }
};
