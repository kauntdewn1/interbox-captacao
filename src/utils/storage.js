/**
 * Storage Adapter - Gateway de leitura/escrita adaptado
 * Suporta Netlify Blobs (produção) e File System (desenvolvimento)
 */
import * as fs from 'fs';
import * as path from 'path';
const projectRootDirectory = process.cwd();
class FileSystemStorage {
    _dataPath = path.resolve(projectRootDirectory, 'data');
    async read(file) {
        const filePath = path.join(this._dataPath, file);
        if (!fs.existsSync(filePath))
            return [];
        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (err) {
            console.error(`Erro ao ler ${filePath}`, err);
            return [];
        }
    }
    async write(file, data) {
        const filePath = path.join(this._dataPath, file);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    async append(file, item) {
        const current = await this.read(file);
        current.push(item);
        await this.write(file, current);
    }
    async exists(file) {
        return fs.existsSync(path.join(this._dataPath, file));
    }
}
class NetlifyBlobsStorage {
    baseUrl = typeof window !== 'undefined' && typeof window.NETLIFY_BLOBS_URL === 'string'
        ? window.NETLIFY_BLOBS_URL
        : '/.netlify/blobs';
    async read(file) {
        try {
            const res = await fetch(`${this.baseUrl}/${file}`);
            if (!res.ok)
                return res.status === 404 ? [] : Promise.reject(res.statusText);
            const json = await res.json();
            return Array.isArray(json) ? json : [];
        }
        catch (err) {
            console.error(`Erro ao ler ${file}`, err);
            return [];
        }
    }
    async write(file, data) {
        const res = await fetch(`${this.baseUrl}/${file}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok)
            throw new Error(`Erro ao escrever ${file}: ${res.statusText}`);
    }
    async append(file, item) {
        const current = await this.read(file);
        current.push(item);
        await this.write(file, current);
    }
    async exists(file) {
        try {
            const res = await fetch(`${this.baseUrl}/${file}`, { method: 'HEAD' });
            return res.ok;
        }
        catch {
            return false;
        }
    }
}
// Helper para pegar env vars em ambos Node.js e browser
const getEnv = (key) => {
    // No Node.js (Netlify Functions)
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    // No browser (Vite) - usar try-catch para evitar erro de bundling
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env[key];
        }
    }
    catch {
        // import.meta não disponível (CJS bundle)
    }
    return undefined;
};
export const createStorage = () => {
    const isProd = getEnv('VITE_NODE_ENV') === 'production' || getEnv('NODE_ENV') === 'production';
    const useBlobs = getEnv('USE_NETLIFY_BLOBS') === 'true';
    return isProd && useBlobs ? new NetlifyBlobsStorage() : new FileSystemStorage();
};
export const validateOrder = (order) => {
    const o = order;
    return (!!o?.produto_id &&
        !!o?.cliente_email &&
        !!o?.cor &&
        !!o?.tamanho &&
        typeof o?.valor === 'number' &&
        o.valor > 0);
};
export const validateReview = (review) => {
    const r = review;
    return (!!r?.produto_id &&
        typeof r?.nota === 'number' &&
        r.nota >= 1 &&
        r.nota <= 5 &&
        !!r?.cliente_email);
};
export const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
export const sanitizeEmail = (email) => String(email ?? '').toLowerCase().trim();
export const sanitizeString = (str) => String(str ?? '').trim().slice(0, 1000);
