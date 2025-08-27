/**
 * API de Administração para Inscrições INTERBØX 2025
 * Gerencia consulta, edição e exportação de dados
 */

import { 
  getInscricoes, 
  getEstatisticas, 
  updateInscricao, 
  deleteInscricao, 
  exportData 
} from '../../src/utils/database.js';

// 🔐 Verificação básica de autenticação (simples)
const isAuthorized = (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const apiKey = process.env.ADMIN_API_KEY || 'interbox2025';
  
  return authHeader === `Bearer ${apiKey}`;
};

// 🚀 Handler principal
export const handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
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
    // Verificar autenticação para operações sensíveis
    if (event.httpMethod !== 'GET' && !isAuthorized(event)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Não autorizado',
          message: 'API Key inválida'
        })
      };
    }

    const { path } = event;
    const pathSegments = path.split('/').filter(Boolean);
    const operation = pathSegments[pathSegments.length - 1];

    switch (event.httpMethod) {
      case 'GET':
        return await handleGet(event, operation);
      case 'PUT':
        return await handlePut(event);
      case 'DELETE':
        return await handleDelete(event);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

  } catch (error) {
    console.error('Erro na API de administração:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno do servidor',
        details: error.message
      })
    };
  }
};

// 🔍 Handler para requisições GET
const handleGet = async (event, operation) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  try {
    switch (operation) {
      case 'inscricoes':
        // Listar inscrições com filtros
        const { queryStringParameters } = event;
        const filtros = queryStringParameters || {};
        
        const inscricoes = getInscricoes(filtros);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: inscricoes,
            total: inscricoes.length,
            filtros
          })
        };

      case 'estatisticas':
        // Obter estatísticas
        const stats = getEstatisticas();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: stats
          })
        };

      case 'export':
        // Exportar dados
        const { formato = 'json' } = event.queryStringParameters || {};
        const dadosExportados = exportData(formato);
        
        if (formato === 'csv') {
          headers['Content-Type'] = 'text/csv';
          headers['Content-Disposition'] = 'attachment; filename="inscricoes_interbox_2025.csv"';
        } else if (formato === 'excel') {
          headers['Content-Type'] = 'application/json';
          headers['Content-Disposition'] = 'attachment; filename="inscricoes_interbox_2025.json"';
        }
        
        return {
          statusCode: 200,
          headers,
          body: formato === 'csv' ? dadosExportados : JSON.stringify(dadosExportados)
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Operação inválida',
            operacoes_validas: ['inscricoes', 'estatisticas', 'export']
          })
        };
    }
  } catch (error) {
    console.error('Erro no GET:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao processar requisição' })
    };
  }
};

// ✏️ Handler para requisições PUT (atualizar)
const handlePut = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  try {
    const { id, updates } = JSON.parse(event.body);
    
    if (!id || !updates) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'ID e updates são obrigatórios' 
        })
      };
    }

    const success = updateInscricao(id, updates);
    
    if (success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Inscrição atualizada com sucesso'
        })
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Inscrição não encontrada'
        })
      };
    }
  } catch (error) {
    console.error('Erro no PUT:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao atualizar inscrição' })
    };
  }
};

// 🗑️ Handler para requisições DELETE
const handleDelete = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  try {
    const { id } = JSON.parse(event.body);
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'ID é obrigatório' 
        })
      };
    }

    const success = deleteInscricao(id);
    
    if (success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Inscrição removida com sucesso'
        })
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Inscrição não encontrada'
        })
      };
    }
  } catch (error) {
    console.error('Erro no DELETE:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao remover inscrição' })
    };
  }
};
