/**
 * API de Sincronização em Tempo Real INTERBØX 2025
 * Centraliza dados de todos os dispositivos em tempo real
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
  console.log('🆕 Criando estrutura padrão de dados');
  return {
    inscricoes: [],
    metadata: {
      ultima_atualizacao: new Date().toISOString(),
      total_inscricoes: 0,
      tipos: {
        judge: 0,
        audiovisual: 0,
        staff: 0
      },
      dispositivos: [],
      ultima_sincronizacao: new Date().toISOString()
    }
  };
};

// 💾 Salvar dados
const saveData = (data) => {
  try {
    // Atualizar metadata
    data.metadata.ultima_atualizacao = new Date().toISOString();
    data.metadata.total_inscricoes = data.inscricoes.length;
    data.metadata.ultima_sincronizacao = new Date().toISOString();
    
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
    console.error('📊 Dados que falharam:', JSON.stringify(data, null, 2));
    return false;
  }
};

// 🆔 Gerar ID único
const generateId = () => {
  return `insc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 🔄 Sincronização inteligente
const smartSync = (dadosNovos, deviceId) => {
  try {
    console.log('🔄 Iniciando sincronização inteligente...');
    console.log('📱 Device ID:', deviceId);
    
    // 🆕 FORÇAR SINCRONIZAÇÃO DE /tmp PARA ARQUIVO LOCAL
    const dadosTmp = readDataFromTmp();
    if (dadosTmp && dadosTmp.inscricoes.length > 0) {
      console.log('📁 Dados encontrados em /tmp, sincronizando...');
      saveData(dadosTmp);
    }
    
    // Ler dados atualizados
    const dadosExistentes = readData();
    console.log('📖 Dados existentes carregados:', dadosExistentes.inscricoes.length, 'inscrições');
    
    // Adicionar device ID se não existir
    if (!dadosExistentes.metadata.dispositivos.includes(deviceId)) {
      dadosExistentes.metadata.dispositivos.push(deviceId);
    }
    
    // Processar cada nova inscrição
    let inscricoesAdicionadas = 0;
    let inscricoesAtualizadas = 0;
    
    dadosNovos.forEach((inscricaoNova) => {
      // Verificar se já existe (por ID ou correlationID)
      const existe = dadosExistentes.inscricoes.find(
        (i) => i.id === inscricaoNova.id || 
               i.correlationID === inscricaoNova.correlationID ||
               (i.email === inscricaoNova.email && i.tipo === inscricaoNova.tipo)
      );
      
      if (existe) {
        // Atualizar inscrição existente
        Object.assign(existe, inscricaoNova, {
          data_atualizacao: new Date().toISOString()
        });
        inscricoesAtualizadas++;
        console.log(`🔄 Inscrição atualizada: ${inscricaoNova.email}`);
      } else {
        // Adicionar nova inscrição
        const inscricaoCompleta = {
          ...inscricaoNova,
          id: inscricaoNova.id || generateId(),
          data_criacao: inscricaoNova.data_criacao || new Date().toISOString(),
          data_atualizacao: new Date().toISOString()
        };
        
        dadosExistentes.inscricoes.push(inscricaoCompleta);
        inscricoesAdicionadas++;
        console.log(`✅ Nova inscrição adicionada: ${inscricaoNova.email}`);
      }
    });
    
    // Salvar dados atualizados
    if (saveData(dadosExistentes)) {
      console.log(`✅ Sincronização concluída: ${inscricoesAdicionadas} adicionadas, ${inscricoesAtualizadas} atualizadas`);
      
      return {
        success: true,
        message: `Sincronização em tempo real concluída`,
        inscricoes_adicionadas: inscricoesAdicionadas,
        inscricoes_atualizadas: inscricoesAtualizadas,
        total_inscricoes: dadosExistentes.inscricoes.length,
        device_id: deviceId
      };
    } else {
      throw new Error('Falha ao salvar dados sincronizados');
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização inteligente:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 🆕 FUNÇÃO PARA LER DADOS DE /tmp
const readDataFromTmp = () => {
  try {
    console.log('📁 Tentando ler dados de /tmp...');
    if (fs.existsSync(NETLIFY_DATA_FILE)) {
      const data = fs.readFileSync(NETLIFY_DATA_FILE, 'utf8');
      const parsedData = JSON.parse(data);
      console.log('✅ Dados de /tmp lidos com sucesso:', parsedData.inscricoes.length, 'inscrições');
      return parsedData;
    }
    console.log('⚠️ Nenhum arquivo encontrado em /tmp');
    return null;
  } catch (error) {
    console.error('❌ Erro ao ler dados de /tmp:', error);
    return null;
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
    console.error('Erro na API de sincronização:', error);
    
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

// 💾 Handler para requisições POST (sincronizar dados)
const handlePost = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  try {
    // 🆕 VERIFICAR AUTENTICAÇÃO PRIMEIRO
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
    const { inscricoes, deviceId } = JSON.parse(event.body);
    
    if (!inscricoes || !Array.isArray(inscricoes)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados inválidos: array de inscrições obrigatório'
        })
      };
    }

    if (!deviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Device ID obrigatório para sincronização'
        })
      };
    }

    console.log(`🔄 Sincronização em tempo real: ${inscricoes.length} inscrições do dispositivo ${deviceId}`);
    
    // Executar sincronização inteligente
    const result = smartSync(inscricoes, deviceId);
    
    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          ...result,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: result.error
        })
      };
    }

  } catch (error) {
    console.error('Erro ao processar sincronização:', error);
    
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
