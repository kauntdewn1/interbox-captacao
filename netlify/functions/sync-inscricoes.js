/**
 * API para Sincronizar Inscrições INTERBØX 2025
 * Sincroniza dados existentes do localStorage com o servidor
 */

import fs from 'fs';
import path from 'path';

// 📁 Caminho para o arquivo de dados
const DATA_FILE = path.join(process.cwd(), 'data', 'inscricoes.json');

// 🔐 Verificação básica de autenticação
const isAuthorized = (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const apiKey = process.env.ADMIN_API_KEY || 'interbox2025';
  
  return authHeader === `Bearer ${apiKey}`;
};

// 📖 Ler dados existentes
const readData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao ler arquivo de dados:', error);
  }
  
  // Retornar estrutura padrão se arquivo não existir
  return {
    inscricoes: [],
    metadata: {
      ultima_atualizacao: new Date().toISOString(),
      total_inscricoes: 0,
      tipos: {
        judge: 0,
        audiovisual: 0,
        staff: 0
      }
    }
  };
};

// 💾 Salvar dados
const saveData = (data) => {
  try {
    // Atualizar metadata
    data.metadata.ultima_atualizacao = new Date().toISOString();
    data.metadata.total_inscricoes = data.inscricoes.length;
    
    // Contar por tipo
    data.metadata.tipos = {
      judge: data.inscricoes.filter(i => i.tipo === 'judge').length,
      audiovisual: data.inscricoes.filter(i => i.tipo === 'audiovisual').length,
      staff: data.inscricoes.filter(i => i.tipo === 'staff').length
    };
    
    // Garantir que o diretório existe
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Dados sincronizados com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar dados:', error);
    return false;
  }
};

// 🔄 Sincronizar dados
const syncData = (dadosLocais) => {
  try {
    // Ler dados existentes no servidor
    const data = readData();
    
    // Para cada inscrição local, verificar se já existe no servidor
    dadosLocais.forEach(inscricaoLocal => {
      // Verificar se já existe por ID ou correlationID
      const existingIndex = data.inscricoes.findIndex(
        i => i.id === inscricaoLocal.id || 
             i.correlationID === inscricaoLocal.correlationID ||
             (i.email === inscricaoLocal.email && i.tipo === inscricaoLocal.tipo)
      );
      
      if (existingIndex >= 0) {
        // Atualizar inscrição existente (preservar dados importantes)
        data.inscricoes[existingIndex] = {
          ...data.inscricoes[existingIndex],
          ...inscricaoLocal,
          id: data.inscricoes[existingIndex].id, // Manter ID original
          data_criacao: data.inscricoes[existingIndex].data_criacao || inscricaoLocal.data_criacao // Manter data de criação
        };
        console.log(`✅ Inscrição sincronizada: ${inscricaoLocal.email}`);
      } else {
        // Adicionar nova inscrição
        data.inscricoes.push(inscricaoLocal);
        console.log(`✅ Nova inscrição adicionada: ${inscricaoLocal.email}`);
      }
    });
    
    // Salvar dados sincronizados
    return saveData(data);
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return false;
  }
};

// 🚀 Handler principal
export const handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verificar se é uma requisição POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método não permitido' })
      };
    }

    // Verificar autenticação
    if (!isAuthorized(event)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Não autorizado',
          message: 'API Key inválida'
        })
      };
    }

    // Parsear dados da requisição
    const { inscricoes } = JSON.parse(event.body);
    
    if (!inscricoes || !Array.isArray(inscricoes)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados inválidos: array de inscrições obrigatório'
        })
      };
    }

    console.log(`🔄 Iniciando sincronização de ${inscricoes.length} inscrições...`);
    
    // Sincronizar dados
    const success = syncData(inscricoes);
    
    if (success) {
      // Ler dados atualizados para retornar
      const dataAtualizada = readData();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `Sincronização concluída: ${inscricoes.length} inscrições processadas`,
          total_inscricoes: dataAtualizada.inscricoes.length,
          inscricoes: dataAtualizada.inscricoes
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro na sincronização'
        })
      };
    }

  } catch (error) {
    console.error('Erro ao sincronizar inscrições:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      })
    };
  }
};
