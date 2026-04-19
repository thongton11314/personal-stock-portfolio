import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../..', 'data');

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readJSON<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

export async function writeJSON<T>(filePath: string, data: T): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listFiles(dirPath: string, extension: string = '.json'): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(f => f.endsWith(extension));
  } catch {
    return [];
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  await fs.unlink(filePath);
}

export function getDataDir(): string {
  return DATA_DIR;
}

export function getHoldingsDir(): string {
  return path.join(DATA_DIR, 'holdings');
}

export function getSettingsPath(): string {
  return path.join(DATA_DIR, 'settings.json');
}

export function getCacheDir(): string {
  return path.join(DATA_DIR, 'cache');
}

export function getBenchmarkDir(): string {
  return path.join(DATA_DIR, 'benchmark');
}

export function getAuditDir(): string {
  return path.join(DATA_DIR, 'audit');
}

export function getTransactionsDir(): string {
  return path.join(DATA_DIR, 'transactions');
}
