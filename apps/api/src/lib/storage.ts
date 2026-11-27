import fs from "node:fs/promises";
import path from "node:path";
import { loadEnv } from "../config/env.js";

export interface StorageAdapter {
  putObject(key: string, data: Buffer | string): Promise<string>;
  getObject(key: string): Promise<Buffer>;
  deleteObject(key: string): Promise<void>;
}

class LocalDiskStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = path.resolve(baseDir);
  }

  private resolveSafePath(key: string): string {
    const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
    const full = path.resolve(this.baseDir, normalized);
    if (!full.startsWith(this.baseDir)) {
      throw new Error("Invalid storage key path traversal attempt");
    }
    return full;
  }

  async putObject(key: string, data: Buffer | string): Promise<string> {
    const target = this.resolveSafePath(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, data);
    return key;
  }

  async getObject(key: string): Promise<Buffer> {
    const target = this.resolveSafePath(key);
    return fs.readFile(target);
  }

  async deleteObject(key: string): Promise<void> {
    const target = this.resolveSafePath(key);
    await fs.rm(target, { force: true });
  }
}

const env = loadEnv();
export const storageAdapter: StorageAdapter = new LocalDiskStorageAdapter(
  env.STORAGE_LOCAL_DIR
);
