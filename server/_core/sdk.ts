import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../infrastructure/repositories";
import { ENV } from "./env";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

/** Simple cookie header parser: "a=1; b=2" -> Map. */
function parseCookieHeader(header: string | undefined) {
  const cookies = new Map<string, string>();
  if (!header) return cookies;

  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (key) cookies.set(key, decodeURIComponent(value));
  }
  return cookies;
}

export type SessionPayload = {
  employeeNumber: string;
  appId: string;
  name: string;
};

class SDKServer {
  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  async createSessionToken(
    employeeNumber: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

    return new SignJWT({
      employeeNumber,
      appId: ENV.appId,
      name: options.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(this.getSessionSecret());
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const { payload } = await jwtVerify(
        cookieValue,
        this.getSessionSecret(),
        {
          algorithms: ["HS256"],
        }
      );
      const { employeeNumber, appId, name } = payload as Record<
        string,
        unknown
      >;

      if (
        !isNonEmptyString(employeeNumber) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        return null;
      }

      return {
        employeeNumber,
        appId,
        name,
      };
    } catch {
      return null;
    }
  }

  /** Local-only auth: session cookie -> DB user. Returns null when unauthenticated. */
  async authenticateRequest(req: Request): Promise<User | null> {
    const sessionToken = parseCookieHeader(req.headers.cookie).get(COOKIE_NAME);
    const session = await this.verifySession(sessionToken);

    if (!session) {
      return null;
    }

    return (await db.getUserByEmployeeNumber(session.employeeNumber)) ?? null;
  }
}

export const sdk = new SDKServer();
