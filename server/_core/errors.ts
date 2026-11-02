export type DatabaseErrorDetails = {
  message: string;
  code?: string;
  errno?: number;
  sqlMessage?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

export function getErrorDetails(error: unknown): DatabaseErrorDetails[] {
  const details: DatabaseErrorDetails[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && !seen.has(current)) {
    seen.add(current);
    const record = asRecord(current);
    if (!record) break;
    details.push({
      message: typeof record.message === "string" ? record.message : String(current),
      code: typeof record.code === "string" ? record.code : undefined,
      errno: typeof record.errno === "number" ? record.errno : undefined,
      sqlMessage: typeof record.sqlMessage === "string" ? record.sqlMessage : undefined,
    });
    current = record.cause;
  }
  return details;
}

export function formatErrorForLog(error: unknown): string {
  return getErrorDetails(error).map((item, index) => {
    const code = item.code ? ` code=${item.code}` : "";
    const errno = item.errno !== undefined ? ` errno=${item.errno}` : "";
    const sql = item.sqlMessage ? ` sqlMessage=${item.sqlMessage}` : "";
    return `[${index}] ${item.message}${code}${errno}${sql}`;
  }).join(" <- ");
}

export function getSafeInternalErrorMessage(error: unknown): string {
  const details = getErrorDetails(error);
  const cause = details.find(item => item.sqlMessage || item.code);
  return cause?.sqlMessage || cause?.code || details[0]?.message || "Unknown error";
}
