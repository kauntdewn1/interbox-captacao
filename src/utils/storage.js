import * as path from 'path';
import * as fs from 'node:fs';

// Usar process.cwd() para evitar problemas com import.meta.url
const projectRootDirectory = process.cwd();

class FileSystemStorage {
	constructor() {
		this._dataPath = path.resolve(projectRootDirectory, 'data');
	}

	get dataPath() {
		return this._dataPath;
	}

	set dataPath(value) {
		this._dataPath = value;
	}

	async read(file) {
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

	async write(file, data) {
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

	async append(file, item) {
		try {
			const existingData = await this.read(file);
			existingData.push(item);
			await this.write(file, existingData);
		} catch (error) {
			console.error(`Erro ao adicionar item ao arquivo ${file}:`, error);
			throw error;
		}
	}

	async exists(file) {
		const filePath = path.join(this._dataPath, file);
		return fs.existsSync(filePath);
	}
}

class NetlifyBlobsStorage {
	constructor() {
		this.baseUrl = process.env.NETLIFY_BLOBS_URL || '/.netlify/blobs';
	}

	async read(file) {
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

	async write(file, data) {
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

	async append(file, item) {
		try {
			const existingData = await this.read(file);
			existingData.push(item);
			await this.write(file, existingData);
		} catch (error) {
			console.error(`Erro ao adicionar item ao blob ${file}:`, error);
			throw error;
		}
	}

	async exists(file) {
		try {
			const response = await fetch(`${this.baseUrl}/${file}`, { method: 'HEAD' });
			return response.ok;
		} catch {
			return false;
		}
	}
}

// Factory
export const createStorage = () => {
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

// Utils
export const validateOrder = (order) => {
	if (typeof order !== 'object' || order === null) return false;
	const orderObj = order;
	return !!(
		orderObj.produto_id &&
		orderObj.cliente_email &&
		orderObj.cor &&
		orderObj.tamanho &&
		orderObj.valor &&
		typeof orderObj.valor === 'number' &&
		orderObj.valor > 0
	);
};

export const validateReview = (review) => {
	if (typeof review !== 'object' || review === null) return false;
	const reviewObj = review;
	return !!(
		reviewObj.produto_id &&
		reviewObj.nota &&
		reviewObj.cliente_email &&
		typeof reviewObj.nota === 'number' &&
		reviewObj.nota >= 1 &&
		reviewObj.nota <= 5
	);
};

export const generateId = (prefix) => {
	const randomToken = Math.random().toString(36).slice(2, 9);
	return `${prefix}_${Date.now()}_${randomToken}`;
};

export const sanitizeEmail = (email) => email.toLowerCase().trim();
export const sanitizeString = (str) => str.trim().substring(0, 1000);
