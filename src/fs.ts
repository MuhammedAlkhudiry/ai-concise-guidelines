/**
 * Shared filesystem utilities
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  rmSync,
  statSync,
} from "fs";
import { mkdir, rm, readdir, copyFile } from "fs/promises";
import { dirname, join } from "path";

// =============================================================================
// Directory utilities
// =============================================================================

/**
 * Ensure directory exists (sync)
 */
export function ensureDirSync(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

/**
 * Ensure parent directory exists (sync)
 */
export function ensureParentDirSync(path: string): void {
  ensureDirSync(dirname(path));
}

/**
 * Ensure directory exists (async)
 */
export async function ensureDir(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

/**
 * Ensure parent directory exists (async)
 */
export async function ensureParentDir(path: string): Promise<void> {
  await ensureDir(dirname(path));
}

// =============================================================================
// Copy utilities
// =============================================================================

export type CopyMode = "clean" | "merge";

export interface CopyDirOptions {
  /** Source directory */
  src: string;
  /** Destination directory */
  dest: string;
  /** Copy mode: 'clean' deletes dest first, 'merge' keeps existing files */
  mode: CopyMode;
  /** File extensions to include (e.g., ['.ts', '.js']). If omitted, copies all files */
  extensions?: string[];
}

/**
 * Copy directory with specified mode (sync)
 * Returns count of files copied
 */
export function copyDirSync(options: CopyDirOptions): number {
  const { src, dest, mode, extensions } = options;

  if (!existsSync(src)) return 0;

  // Clean mode: delete destination first
  if (mode === "clean" && existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }

  ensureDirSync(dest);

  let count = 0;
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      count += copyDirSync({ src: srcPath, dest: destPath, mode, extensions });
    } else if (entry.isFile()) {
      // Check extension filter
      if (extensions && extensions.length > 0) {
        const hasValidExt = extensions.some((ext) => entry.name.endsWith(ext));
        if (!hasValidExt) continue;
      }
      copyFileSync(srcPath, destPath);
      count++;
    }
  }

  return count;
}

/**
 * Copy directory (async version)
 * Returns count of files copied
 */
export async function copyDirAsync(options: CopyDirOptions): Promise<number> {
  const { src, dest, mode, extensions } = options;

  if (!existsSync(src)) return 0;

  // Clean mode: delete destination first
  if (mode === "clean" && existsSync(dest)) {
    await rm(dest, { recursive: true, force: true });
  }

  await ensureDir(dest);

  let count = 0;
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      count += await copyDirAsync({ src: srcPath, dest: destPath, mode, extensions });
    } else if (entry.isFile()) {
      if (extensions && extensions.length > 0) {
        const hasValidExt = extensions.some((ext) => entry.name.endsWith(ext));
        if (!hasValidExt) continue;
      }
      await copyFile(srcPath, destPath);
      count++;
    }
  }

  return count;
}

/**
 * Count items in directory matching criteria
 */
export function countInDir(
  dir: string,
  options: { type: "file" | "dir"; extensions?: string[] }
): number {
  if (!existsSync(dir)) return 0;

  const entries = readdirSync(dir);
  return entries.filter((name) => {
    const path = join(dir, name);
    const stat = statSync(path);

    if (options.type === "dir" && !stat.isDirectory()) return false;
    if (options.type === "file" && !stat.isFile()) return false;

    if (options.extensions && options.extensions.length > 0) {
      return options.extensions.some((ext) => name.endsWith(ext));
    }

    return true;
  }).length;
}
