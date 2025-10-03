/**
 * Storage Adapter - Gateway de leitura/escrita adaptado
 * Suporta Netlify Blobs (produção) e File System (desenvolvimento)
 */

import * as fs from 'fs';
import * as path from 'path';

const projectRootDirectory = process.cwd();

export interface StorageItem {
  id: string;
  [key: string]: unknown;
}

export interface StorageAdapter {
  read(file: string): Promise<unknown[]>;
  write(file: string, data: unknown[]): Promise<void>;
  append(file: string, item: StorageItem): Promise<void>;
  exists(file: string): Promise<boolean>;
}

class FileSystemStorage implements StorageAdapter {
  private _dataPath = path.resolve(projectRootDirectory, 'data');

  async read(file: string): Promise<unknown[]> {
    const filePath = path.join(this._dataPath, file);
    if (!fs.existsSync(filePath)) return [];
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Erro ao ler ${filePath}`, err);
      return [];
    }
  }

  async write(file: string, data: unknown[]): Promise<void> {
    const filePath = path.join(this._dataPath, file);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  async append(file: string, item: StorageItem): Promise<void> {
    const current = await this.read(file);
    current.push(item);
    await this.write(file, current);
  }

  async exists(file: string): Promise<boolean> {
    return fs.existsSync(path.join(this._dataPath, file));
  }
}

class NetlifyBlobsStorage implements StorageAdapter {
  private readonly baseUrl: string =
    typeof window !== 'undefined' && typeof (window as unknown as { NETLIFY_BLOBS_URL?: string }).NETLIFY_BLOBS_URL === 'string'
      ? (window as unknown as { NETLIFY_BLOBS_URL: string }).NETLIFY_BLOBS_URL
      : '/.netlify/blobs';

  async read(file: string): Promise<unknown[]> {
    try {
      const res = await fetch(`${this.baseUrl}/${file}`);
      if (!res.ok) return res.status === 404 ? [] : Promise.reject(res.statusText);
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch (err) {
      console.error(`Erro ao ler ${file}`, err);
      return [];
    }
  }

  async write(file: string, data: unknown[]): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${file}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Erro ao escrever ${file}: ${res.statusText}`);
  }

  async append(file: string, item: StorageItem): Promise<void> {
    const current = await this.read(file);
    current.push(item);
    await this.write(file, current);
  }

  async exists(file: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/${file}`, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

// Helper para pegar env vars em ambos Node.js e browser
const getEnv = (key: string): string | undefined => {
  // No Node.js (Netlify Functions)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  // No browser (Vite) - usar try-catch para evitar erro de bundling
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env as Record<string, string>)[key];
    }
  } catch {
    // import.meta não disponível (CJS bundle)
  }
  return undefined;
};

export const createStorage = (): StorageAdapter => {
  const isProd = getEnv('VITE_NODE_ENV') === 'production' || getEnv('NODE_ENV') === 'production';
  const useBlobsFlag = getEnv('USE_NETLIFY_BLOBS') === 'true';
  const isNetlifyEnv = typeof process !== 'undefined' && !!process.env.NETLIFY;
  // Em produção/Netlify, priorize Blobs automaticamente (mesmo sem flag)
  if (useBlobsFlag || isProd || isNetlifyEnv) {
    return new NetlifyBlobsStorage();
  }
  return new FileSystemStorage();
};

export const validateOrder = (order: unknown): boolean => {
  const o = order as Record<string, unknown>;
  return (
    !!o?.produto_id &&
    !!o?.cliente_email &&
    !!o?.cor &&
    !!o?.tamanho &&
    typeof o?.valor === 'number' &&
    o.valor > 0
  );
};

export const validateReview = (review: unknown): boolean => {
  const r = review as Record<string, unknown>;
  return (
    !!r?.produto_id &&
    typeof r?.nota === 'number' &&
    r.nota >= 1 &&
    r.nota <= 5 &&
    !!r?.cliente_email
  );
};

export const generateId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const sanitizeEmail = (email?: string | null): string =>
  String(email ?? '').toLowerCase().trim();

export const sanitizeString = (str?: string | null): string =>
  String(str ?? '').trim().slice(0, 1000);
