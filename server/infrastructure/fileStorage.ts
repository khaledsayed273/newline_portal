import path from "node:path";
import { mkdir, unlink } from "node:fs/promises";

export const MANUS_STORAGE_URL_PREFIX = "/manus-storage/";
export const MANUS_STORAGE_ROOT = path.resolve(
  process.cwd(),
  "server",
  "public",
  "manus-storage"
);

export async function ensureManusStorageDirectory(
  directory = MANUS_STORAGE_ROOT
) {
  await mkdir(directory, { recursive: true });
  return directory;
}

function getLocalStoragePath(fileUrl: string | null | undefined) {
  if (!fileUrl?.startsWith(MANUS_STORAGE_URL_PREFIX)) return null;

  const relativePath = decodeURIComponent(
    fileUrl.slice(MANUS_STORAGE_URL_PREFIX.length)
  );
  const filePath = path.resolve(MANUS_STORAGE_ROOT, relativePath);
  const relativeToRoot = path.relative(MANUS_STORAGE_ROOT, filePath);

  if (
    !relativeToRoot ||
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot)
  ) {
    return null;
  }

  return filePath;
}

export async function deleteStoredFile(fileUrl: string | null | undefined) {
  const filePath = getLocalStoragePath(fileUrl);
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error("[FileStorage] Failed to delete file:", filePath, error);
    }
  }
}

export async function deleteStoredFiles(
  fileUrls: Array<string | null | undefined>
) {
  await Promise.all(fileUrls.map(deleteStoredFile));
}
