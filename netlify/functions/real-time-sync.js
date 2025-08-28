/**
 * API de Sincronização em Tempo Real INTERBØX 2025
 * Centraliza dados de todos os dispositivos em tempo real
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
    console.log('📁 Tentando ler arquivo:', DATA_FILE);
    
    if (fs.existsSync(DATA_FILE)) {
      console.log('✅ Arquivo existe, lendo...');
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsedData = JSON.parse(data);
      console.log('📖 Dados lidos com sucesso:', parsedData.inscricoes.length, 'inscrições');
      return parsedData;
    } else {
      console.log('⚠️ Arquivo não existe, criando estrutura padrão');
    }
  } catch (error) {
    console.error('❌ Erro ao ler arquivo de dados:', error);
    console.error('📁 Caminho tentado:', DATA_FILE);
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
    
    // Garantir que o diretório existe
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Debug: Verificar caminho e dados
    console.log('📁 Caminho do arquivo:', DATA_FILE);
    console.log('📊 Dados para salvar:', JSON.stringify(data, null, 2));
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Dados sincronizados em tempo real');
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar dados:', error);
    console.error('📁 Caminho tentado:', DATA_FILE);
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
    console.log('📊 Dados novos recebidos:', dadosNovos.length);
    
    const data = readData();
    console.log('📖 Dados existentes carregados:', data.inscricoes.length);
    
    // Adicionar dispositivo à lista
    if (!data.metadata.dispositivos.includes(deviceId)) {
      data.metadata.dispositivos.push(deviceId);
      console.log('📱 Novo dispositivo registrado:', deviceId);
    }
    
    let inscricoesAdicionadas = 0;
    let inscricoesAtualizadas = 0;
    
    dadosNovos.forEach((inscricaoNova, index) => {
      console.log(`🔍 Processando inscrição ${index + 1}/${dadosNovos.length}:`, inscricaoNova.email || inscricaoNova.nome);
      
      // Verificar se já existe por múltiplos critérios
      const existingIndex = data.inscricoes.findIndex(
        i => i.id === inscricaoNova.id || 
             i.correlationID === inscricaoNova.correlationID ||
             (i.email === inscricaoNova.email && i.tipo === inscricaoNova.tipo) ||
             (i.cpf === inscricaoNova.cpf && i.cpf !== 'CPF não informado')
      );
      
      if (existingIndex >= 0) {
        // Atualizar inscrição existente (preservar dados importantes)
        const inscricaoExistente = data.inscricoes[existingIndex];
        console.log(`🔄 Atualizando inscrição existente: ${inscricaoExistente.email || inscricaoExistente.nome}`);
        
        data.inscricoes[existingIndex] = {
          ...inscricaoExistente,
          ...inscricaoNova,
          id: inscricaoExistente.id, // Manter ID original
          data_criacao: inscricaoExistente.data_criacao || inscricaoNova.data_criacao,
          data_atualizacao: new Date().toISOString(),
          // Preservar dados reais se existirem
          nome: inscricaoNova.nome !== 'Candidato staff' ? inscricaoNova.nome : inscricaoExistente.nome,
          email: inscricaoNova.email !== 'staff@interbox.com' ? inscricaoNova.email : inscricaoExistente.email,
          whatsapp: inscricaoNova.whatsapp !== 'WhatsApp não informado' ? inscricaoNova.whatsapp : inscricaoExistente.whatsapp,
          cpf: inscricaoNova.cpf !== 'CPF não informado' ? inscricaoNova.cpf : inscricaoExistente.cpf
        };
        
        inscricoesAtualizadas++;
        console.log(`✅ Inscrição atualizada: ${inscricaoNova.email || inscricaoNova.nome}`);
      } else {
        // Adicionar nova inscrição
        const novaInscricao = {
          ...inscricaoNova,
          id: generateId(),
          data_atualizacao: new Date().toISOString(),
          device_id: deviceId
        };
        
        data.inscricoes.push(novaInscricao);
        inscricoesAdicionadas++;
        console.log(`✅ Nova inscrição adicionada: ${inscricaoNova.email || inscricaoNova.nome}`);
      }
    });
    
    console.log(`📊 Resumo: ${inscricoesAdicionadas} novas, ${inscricoesAtualizadas} atualizadas`);
    console.log(`📊 Total final: ${data.inscricoes.length} inscrições`);
    
    // Salvar dados
    console.log('💾 Salvando dados...');
    if (saveData(data)) {
      console.log('✅ Dados salvos com sucesso!');
      return {
        success: true,
        inscricoesAdicionadas,
        inscricoesAtualizadas,
        total_inscricoes: data.inscricoes.length,
        message: `Sincronização concluída: ${inscricoesAdicionadas} novas, ${inscricoesAtualizadas} atualizadas`
      };
    } else {
      console.log('❌ Falha ao salvar dados');
      return { success: false, error: 'Erro ao salvar dados' };
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização inteligente:', error);
    return { success: false, error: error.message };
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
