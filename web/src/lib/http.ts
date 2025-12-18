import { NextRequest, NextResponse } from "next/server";

export const jsonResponse = (
  status: number,
  payload: unknown,
  {
    cookies,
    clearCookies
  }: { cookies?: { name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] }[]; clearCookies?: string[] } = {}
) => {
  const res = NextResponse.json(payload, { status });
  cookies?.forEach((c) => res.cookies.set(c.name, c.value, c.options || {}));
  clearCookies?.forEach((name) => res.cookies.set(name, "", { maxAge: 0, path: "/" }));
  return res;
};

export const getClientIp = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
  req.headers.get("x-real-ip") ||
  req.ip ||
  "unknown";
