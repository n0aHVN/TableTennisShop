import type { Request } from "express";

/** Express 5 types `req.params` values as `string | string[]`; plain `:name` routes are a single string. */
export function routeParam(req: Request, name: string): string {
  return req.params[name] as string;
}
