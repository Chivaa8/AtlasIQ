import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export function createJsonStore(filePath, fallback = []) {
  return {
    async read() {
      try {
        return JSON.parse(await readFile(filePath, "utf8"));
      } catch (error) {
        if (error.code === "ENOENT") return fallback;
        throw error;
      }
    },
    async write(data) {
      await mkdir(dirname(filePath), { recursive: true });
      const tempPath = `${filePath}.tmp`;
      await writeFile(tempPath, JSON.stringify(data, null, 2));
      await rename(tempPath, filePath);
    }
  };
}
