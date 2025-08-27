/**
 * Sistema de Gerenciamento de Banco JSON para INTERBØX 2025
 * Gerencia inscrições confirmadas com persistência local
 */

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'inscricoes.json');

// 🔧 Função para carregar banco de dados
const loadDatabase = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
    // Criar banco se não existir
    const initialDB = {
      inscricoes: [],
      metadata: {
        ultima_atualizacao: new Date().toISOString(),
        total_inscricoes: 0,
        tipos: { judge: 0, audiovisual: 0, staff: 0 }
      }
    };
    saveDatabase(initialDB);
    return initialDB;
  } catch (error) {
    console.error('Erro ao carregar banco:', error);
    return null;
  }
};

// 💾 Função para salvar banco de dados
const saveDatabase = (data) => {
  try {
    // Garantir que o diretório existe
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Atualizar metadata
    data.metadata.ultima_atualizacao = new Date().toISOString();
    data.metadata.total_inscricoes = data.inscricoes.length;
    
    // Contar por tipo
    data.metadata.tipos = {
      judge: data.inscricoes.filter(i => i.tipo === 'judge').length,
      audiovisual: data.inscricoes.filter(i => i.tipo === 'audiovisual').length,
      staff: data.inscricoes.filter(i => i.tipo === 'staff').length
    };
    
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar banco:', error);
    return false;
  }
};

// ➕ Adicionar nova inscrição
export const addInscricao = (inscricaoData) => {
  try {
    const db = loadDatabase();
    if (!db) return false;
    
    const novaInscricao = {
      id: `insc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...inscricaoData,
      data_criacao: new Date().toISOString(),
      status: 'confirmado'
    };
    
    db.inscricoes.push(novaInscricao);
    return saveDatabase(db);
  } catch (error) {
    console.error('Erro ao adicionar inscrição:', error);
    return false;
  }
};

// 🔍 Buscar inscrições com filtros
export const getInscricoes = (filtros = {}) => {
  try {
    const db = loadDatabase();
    if (!db) return [];
    
    let inscricoes = [...db.inscricoes];
    
    // Filtrar por tipo
    if (filtros.tipo) {
      inscricoes = inscricoes.filter(i => i.tipo === filtros.tipo);
    }
    
    // Filtrar por status
    if (filtros.status) {
      inscricoes = inscricoes.filter(i => i.status === filtros.status);
    }
    
    // Filtrar por data
    if (filtros.data_inicio) {
      inscricoes = inscricoes.filter(i => new Date(i.data_criacao) >= new Date(filtros.data_inicio));
    }
    
    if (filtros.data_fim) {
      inscricoes = inscricoes.filter(i => new Date(i.data_criacao) <= new Date(filtros.data_fim));
    }
    
    // Ordenar por data (mais recente primeiro)
    inscricoes.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
    
    return inscricoes;
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    return [];
  }
};

// 📊 Obter estatísticas
export const getEstatisticas = () => {
  try {
    const db = loadDatabase();
    if (!db) return null;
    
    return {
      ...db.metadata,
      inscricoes_por_mes: getInscricoesPorMes(db.inscricoes),
      valor_total: db.inscricoes.reduce((total, i) => total + i.valor, 0)
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return null;
  }
};

// 📅 Agrupar inscrições por mês
const getInscricoesPorMes = (inscricoes) => {
  const meses = {};
  
  inscricoes.forEach(inscricao => {
    const data = new Date(inscricao.data_criacao);
    const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    
    if (!meses[mesAno]) {
      meses[mesAno] = { total: 0, tipos: { judge: 0, audiovisual: 0, staff: 0 } };
    }
    
    meses[mesAno].total++;
    meses[mesAno].tipos[inscricao.tipo]++;
  });
  
  return meses;
};

// 🔄 Atualizar inscrição
export const updateInscricao = (id, updates) => {
  try {
    const db = loadDatabase();
    if (!db) return false;
    
    const index = db.inscricoes.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    db.inscricoes[index] = {
      ...db.inscricoes[index],
      ...updates,
      data_atualizacao: new Date().toISOString()
    };
    
    return saveDatabase(db);
  } catch (error) {
    console.error('Erro ao atualizar inscrição:', error);
    return false;
  }
};

// 🗑️ Remover inscrição
export const deleteInscricao = (id) => {
  try {
    const db = loadDatabase();
    if (!db) return false;
    
    db.inscricoes = db.inscricoes.filter(i => i.id !== id);
    return saveDatabase(db);
  } catch (error) {
    console.error('Erro ao remover inscrição:', error);
    return false;
  }
};

// 📤 Exportar dados
export const exportData = (formato = 'json') => {
  try {
    const db = loadDatabase();
    if (!db) return null;
    
    switch (formato.toLowerCase()) {
      case 'csv':
        return exportToCSV(db.inscricoes);
      case 'excel':
        return exportToExcel(db.inscricoes);
      default:
        return db;
    }
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    return null;
  }
};

// 📊 Exportar para CSV
const exportToCSV = (inscricoes) => {
  if (inscricoes.length === 0) return '';
  
  const headers = ['ID', 'Nome', 'Email', 'WhatsApp', 'Tipo', 'Valor', 'Data Criação', 'Status'];
  const rows = inscricoes.map(i => [
    i.id,
    i.nome || '',
    i.email || '',
    i.whatsapp || '',
    i.tipo || '',
    `R$ ${(i.valor / 100).toFixed(2)}`,
    new Date(i.data_criacao).toLocaleDateString('pt-BR'),
    i.status || ''
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};

// 📈 Exportar para Excel (formato JSON que pode ser convertido)
const exportToExcel = (inscricoes) => {
  return inscricoes.map(i => ({
    'ID': i.id,
    'Nome': i.nome || '',
    'Email': i.email || '',
    'WhatsApp': i.whatsapp || '',
    'Tipo': i.tipo || '',
    'Valor (R$)': (i.valor / 100).toFixed(2),
    'Data Criação': new Date(i.data_criacao).toLocaleDateString('pt-BR'),
    'Status': i.status || ''
  }));
};
