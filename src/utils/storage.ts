/**
 * Storage Adapter - Único gateway de leitura/escrita
 * Suporta Netlify Blobs (produção) e File System (desenvolvimento)
 * Zero lock-in, controle total, arquitetura descentralizada
 */

import * as path from 'path';
import * as fs from 'node:fs';

const projectRootDirectory = process.cwd();

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface StorageItem {
	id: string;
	[key: string]: unknown;
}

export interface StorageAdapter {
	read: (file: string) => Promise<unknown[]>;
	write: (file: string, data: unknown[]) => Promise<void>;
	append: (file: string, item: StorageItem) => Promise<void>;
	exists: (file: string) => Promise<boolean>;
}

// ============================================================================
// Storage Implementations
// ============================================================================

class FileSystemStorage implements StorageAdapter {
	private _dataPath: string;

	constructor() {
		this._dataPath = path.resolve(projectRootDirectory, 'data');
	}

	get dataPath(): string {
		return this._dataPath;
	}

	set dataPath(value: string) {
		this._dataPath = value;
	}

	async read(file: string): Promise<unknown[]> {
		try {
			const filePath = path.join(this._dataPath, file);
			if (!fs.existsSync(filePath)) {
				return [];
			}
			const data = fs.readFileSync(filePath, 'utf-8');
			return JSON.parse(data);
		} catch (error) {
			console.error(`Erro ao ler arquivo ${file}:`, error);
			return [];
		}
	}

	async write(file: string, data: unknown[]): Promise<void> {
		try {
			const filePath = path.join(this._dataPath, file);
			const dirPath = path.dirname(filePath);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}
			fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
		} catch (error) {
			console.error(`Erro ao escrever arquivo ${file}:`, error);
			throw error;
		}
	}

	async append(file: string, item: StorageItem): Promise<void> {
		try {
			const existingData = await this.read(file);
			existingData.push(item);
			await this.write(file, existingData);
		} catch (error) {
			console.error(`Erro ao adicionar item ao arquivo ${file}:`, error);
			throw error;
		}
	}

	async exists(file: string): Promise<boolean> {
		const filePath = path.join(this._dataPath, file);
		return fs.existsSync(filePath);
	}
}

class NetlifyBlobsStorage implements StorageAdapter {
	private readonly baseUrl: string;

	constructor() {
		this.baseUrl = process.env.NETLIFY_BLOBS_URL || '/.netlify/blobs';
	}

	async read(file: string): Promise<unknown[]> {
		try {
			const response = await fetch(`${this.baseUrl}/${file}`);
			if (!response.ok) {
				if (response.status === 404) {
					return [];
				}
				throw new Error(`Erro ao ler blob ${file}: ${response.status}`);
			}
			const data = await response.json();
			return Array.isArray(data) ? data : [];
		} catch (error) {
			console.error(`Erro ao ler blob ${file}:`, error);
			return [];
		}
	}

	async write(file: string, data: unknown[]): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/${file}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				throw new Error(`Erro ao escrever blob ${file}: ${response.status}`);
			}
		} catch (error) {
			console.error(`Erro ao escrever blob ${file}:`, error);
			throw error;
		}
	}

	async append(file: string, item: StorageItem): Promise<void> {
		try {
			const existingData = await this.read(file);
			existingData.push(item);
			await this.write(file, existingData);
		} catch (error) {
			console.error(`Erro ao adicionar item ao blob ${file}:`, error);
			throw error;
		}
	}

	async exists(file: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/${file}`, { method: 'HEAD' });
			return response.ok;
		} catch {
			return false;
		}
	}
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Factory function - Retorna o adapter correto baseado no ambiente
 */
export const createStorage = (): StorageAdapter => {
	const isProduction = process.env.NODE_ENV === 'production';
	const useBlobs = process.env.USE_NETLIFY_BLOBS === 'true';

	if (isProduction && useBlobs) {
		console.log('🗄️ Usando Netlify Blobs Storage');
		return new NetlifyBlobsStorage();
	} else {
		console.log('📁 Usando File System Storage');
		return new FileSystemStorage();
	}
};

// ============================================================================
// Validation Utilities
// ============================================================================

export const validateOrder = (order: unknown): boolean => {
	if (typeof order !== 'object' || order === null) return false;

	const orderObj = order as Record<string, unknown>;
	return !!(
		orderObj.produto_id &&
		orderObj.cliente_email &&
		orderObj.cor &&
		orderObj.tamanho &&
		orderObj.valor &&
		typeof orderObj.valor === 'number' &&
		(orderObj.valor as number) > 0
	);
};

export const validateReview = (review: unknown): boolean => {
	if (typeof review !== 'object' || review === null) return false;

	const reviewObj = review as Record<string, unknown>;
	return !!(
		reviewObj.produto_id &&
		reviewObj.nota &&
		reviewObj.cliente_email &&
		typeof reviewObj.nota === 'number' &&
		(reviewObj.nota as number) >= 1 &&
		(reviewObj.nota as number) <= 5
	);
};

// ============================================================================
// ID & Data Sanitization Utilities
// ============================================================================

/**
 * Gerador de IDs únicos com prefix + timestamp + token aleatório
 */
export const generateId = (prefix: string): string => {
	const randomToken = Math.random().toString(36).slice(2, 9);
	return `${prefix}_${Date.now()}_${randomToken}`;
};

/**
 * Sanitiza email para lowercase e remove espaços
 * Aceita valores null/undefined e retorna string vazia
 */
export const sanitizeEmail = (email?: string | null): string => {
	return String(email ?? '').toLowerCase().trim();
};

/**
 * Sanitiza string genérica com limite de 1000 caracteres
 * Aceita valores null/undefined e retorna string vazia
 */
export const sanitizeString = (str?: string | null): string => {
	return String(str ?? '').trim().substring(0, 1000);
};
