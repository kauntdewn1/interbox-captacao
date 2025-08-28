/**
 * API para Salvar Inscrições INTERBØX 2025
 * Salva inscrições gratuitas e pagas no banco de dados
 */

import fs from 'fs';
import path from 'path';

// 📁 Caminho para o arquivo de dados (Netlify)
const DATA_FILE = path.join(process.cwd(), 'data', 'inscricoes.json');

// 🆕 CAMINHO ALTERNATIVO PARA NETLIFY
const NETLIFY_DATA_FILE = '/tmp/inscricoes.json';

// 🔐 Verificação básica de autenticação
const isAuthorized = (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const apiKey = process.env.ADMIN_API_KEY || 'interbox2025';
  
  return authHeader === `Bearer ${apiKey}`;
};

// 📖 Ler dados existentes
const readData = () => {
  try {
    console.log('📁 Tentando ler arquivo local:', DATA_FILE);
    
    // 🆕 TENTAR LER DO DIRETÓRIO DATA PRIMEIRO
    if (fs.existsSync(DATA_FILE)) {
      console.log('✅ Arquivo local existe, lendo...');
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsedData = JSON.parse(data);
      console.log('📖 Dados locais lidos com sucesso:', parsedData.inscricoes.length, 'inscrições');
      return parsedData;
    }
    
    // 🆕 FALLBACK: TENTAR LER DE /tmp (Netlify)
    console.log('📁 Tentando ler arquivo Netlify:', NETLIFY_DATA_FILE);
    if (fs.existsSync(NETLIFY_DATA_FILE)) {
      console.log('✅ Arquivo Netlify existe, lendo...');
      const data = fs.readFileSync(NETLIFY_DATA_FILE, 'utf8');
      const parsedData = JSON.parse(data);
      console.log('📖 Dados Netlify lidos com sucesso:', parsedData.inscricoes.length, 'inscrições');
      return parsedData;
    }
    
    console.log('⚠️ Nenhum arquivo encontrado, criando estrutura padrão');
  } catch (error) {
    console.error('❌ Erro ao ler arquivo de dados:', error);
    console.error('📁 Caminhos tentados:', DATA_FILE, 'e', NETLIFY_DATA_FILE);
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
    
    // 🆕 TENTAR SALVAR NO DIRETÓRIO DATA PRIMEIRO
    try {
      // Garantir que o diretório existe
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      console.log('📁 Tentando salvar em:', DATA_FILE);
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
      console.log('✅ Dados salvos em data/inscricoes.json');
      return true;
    } catch (localError) {
      console.log('⚠️ Erro ao salvar localmente, tentando /tmp:', localError.message);
      
      // 🆕 FALLBACK: SALVAR EM /tmp (Netlify)
      try {
        console.log('📁 Tentando salvar em:', NETLIFY_DATA_FILE);
        fs.writeFileSync(NETLIFY_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ Dados salvos em /tmp/inscricoes.json (Netlify)');
        return true;
      } catch (tmpError) {
        console.error('❌ Erro ao salvar em /tmp:', tmpError.message);
        throw tmpError;
      }
    }
  } catch (error) {
    console.error('❌ Erro ao salvar dados:', error);
    console.error('📁 Caminhos tentados:', DATA_FILE, 'e', NETLIFY_DATA_FILE);
    return false;
  }
};

// 🆔 Gerar ID único
const generateId = () => {
  return `insc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 🔍 Handler para requisições GET (listar inscrições)
const handleGet = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  try {
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

    // Ler dados existentes
    const data = readData();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        inscricoes: data.inscricoes,
        metadata: data.metadata
      })
    };
  } catch (error) {
    console.error('Erro ao listar inscrições:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro ao listar inscrições'
      })
    };
  }
};

// 💾 Handler para requisições POST (criar/atualizar inscrições)
const handlePost = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  try {
    // Parsear dados da requisição
    const inscricaoData = JSON.parse(event.body);
    
    // Validar dados obrigatórios
    if (!inscricaoData.nome || !inscricaoData.email || !inscricaoData.tipo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados obrigatórios: nome, email e tipo'
        })
      };
    }

    // Ler dados existentes
    const data = readData();
    
    // Verificar se já existe inscrição com mesmo email e tipo
    const existingIndex = data.inscricoes.findIndex(
      i => i.email === inscricaoData.email && i.tipo === inscricaoData.tipo
    );

    // Preparar dados da inscrição
    const novaInscricao = {
      id: generateId(),
      nome: inscricaoData.nome,
      email: inscricaoData.email,
      whatsapp: inscricaoData.whatsapp || '',
      cpf: inscricaoData.cpf || '',
      tipo: inscricaoData.tipo,
      valor: inscricaoData.valor || 0,
      status: inscricaoData.status || 'cadastrado',
      correlationID: inscricaoData.correlationID || '',
      charge_id: inscricaoData.charge_id || '',
      data_criacao: inscricaoData.data_criacao || new Date().toISOString(),
      data_atualizacao: new Date().toISOString(),
      // Campos específicos por tipo
      ...(inscricaoData.tipo === 'judge' && {
        certificacoes: inscricaoData.certificacoes || '',
        experiencia: inscricaoData.experiencia || '',
        disponibilidade: inscricaoData.disponibilidade || '',
        motivacao: inscricaoData.motivacao || ''
      }),
      ...(inscricaoData.tipo === 'staff' && {
        experiencia: inscricaoData.experiencia || '',
        disponibilidade: inscricaoData.disponibilidade || '',
        motivacao: inscricaoData.motivacao || ''
      }),
      ...(inscricaoData.tipo === 'audiovisual' && {
        portfolio: inscricaoData.portfolio || '',
        experiencia: inscricaoData.experiencia || '',
        disponibilidade: inscricaoData.disponibilidade || '',
        motivacao: inscricaoData.motivacao || ''
      })
    };

    if (existingIndex >= 0) {
      // Atualizar inscrição existente
      data.inscricoes[existingIndex] = {
        ...data.inscricoes[existingIndex],
        ...novaInscricao,
        id: data.inscricoes[existingIndex].id, // Manter ID original
        data_criacao: data.inscricoes[existingIndex].data_criacao // Manter data de criação
      };
      console.log('✅ Inscrição atualizada:', novaInscricao.email);
    } else {
      // Adicionar nova inscrição
      data.inscricoes.push(novaInscricao);
      console.log('✅ Nova inscrição criada:', novaInscricao.email);
    }

    // Salvar dados
    if (saveData(data)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: existingIndex >= 0 ? 'Inscrição atualizada' : 'Inscrição criada',
          inscricao: novaInscricao,
          total_inscricoes: data.inscricoes.length
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao salvar dados'
        })
      };
    }
  } catch (error) {
    console.error('Erro ao processar inscrição:', error);
    
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

// 🚀 Handler principal
export const handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
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
    // Verificar método HTTP
    if (event.httpMethod === 'GET') {
      return await handleGet(event);
    } else if (event.httpMethod === 'POST') {
      return await handlePost(event);
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método não permitido' })
      };
    }
  } catch (error) {
    console.error('Erro ao processar inscrição:', error);
    
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
