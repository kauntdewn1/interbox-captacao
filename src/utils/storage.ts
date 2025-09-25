/**
 * Storage Adapter - Único gateway de leitura/escrita
 * Suporta Netlify Blobs (produção) e File System (desenvolvimento)
 * Zero lock-in, controle total, arquitetura descentralizada
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface StorageItem {
  id: string;
  [key: string]: any;
}

export interface StorageAdapter {
  read: (file: string) => Promise<any[]>;
  write: (file: string, data: any[]) => Promise<void>;
  append: (file: string, item: StorageItem) => Promise<void>;
  exists: (file: string) => Promise<boolean>;
}

class FileSystemStorage implements StorageAdapter {
  private dataPath: string;

  constructor() {
    this.dataPath = path.resolve(__dirname, '../../data');
  }

  async read(file: string): Promise<any[]> {
    try {
      const filePath = path.join(this.dataPath, file);
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

  async write(file: string, data: any[]): Promise<void> {
    try {
      const filePath = path.join(this.dataPath, file);
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
    const filePath = path.join(this.dataPath, file);
    return fs.existsSync(filePath);
  }
}

class NetlifyBlobsStorage implements StorageAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NETLIFY_BLOBS_URL || '/.netlify/blobs';
  }

  async read(file: string): Promise<any[]> {
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

  async write(file: string, data: any[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${file}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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

/**
 * Utilitários para validação e sanitização
 */
export const validateOrder = (order: any): boolean => {
  return !!(
    order.produto_id &&
    order.cliente_email &&
    order.cor &&
    order.tamanho &&
    order.valor &&
    typeof order.valor === 'number' &&
    order.valor > 0
  );
};

export const validateReview = (review: any): boolean => {
  return !!(
    review.produto_id &&
    review.nota &&
    review.cliente_email &&
    typeof review.nota === 'number' &&
    review.nota >= 1 &&
    review.nota <= 5
  );
};

/**
 * Gerador de IDs únicos
 */
export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sanitização de dados
 */
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeString = (str: string): string => {
  return str.trim().substring(0, 1000); // Limite de 1000 caracteres
};
