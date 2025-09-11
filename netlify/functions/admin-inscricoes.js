/**
 * API de Administração para Inscrições INTERBØX 2025
 * Gerencia consulta, edição e exportação de dados via Supabase
 */

import { createClient } from '@supabase/supabase-js';

// 🔗 Configuração Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://ymriypyyirnwctyitcsu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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
        
        // Construir query com filtros
        let query = supabase
          .from('inscricoes')
          .select('*')
          .order('data_criacao', { ascending: false });
        
        // Aplicar filtros
        if (filtros.tipo) {
          query = query.eq('tipo', filtros.tipo);
        }
        if (filtros.status) {
          query = query.eq('status', filtros.status);
        }
        if (filtros.data_inicio) {
          query = query.gte('data_criacao', filtros.data_inicio);
        }
        if (filtros.data_fim) {
          query = query.lte('data_criacao', filtros.data_fim);
        }
        
        const { data: inscricoesFiltradas, error: fetchError } = await query;
        
        if (fetchError) {
          console.error('Erro ao buscar inscrições:', fetchError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Erro ao buscar inscrições'
            })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: inscricoesFiltradas || [],
            total: (inscricoesFiltradas || []).length,
            filtros
          })
        };

      case 'estatisticas':
        // Obter estatísticas do Supabase
        const { data: inscricoes, error: statsError } = await supabase
          .from('inscricoes')
          .select('*');
        
        if (statsError) {
          console.error('Erro ao buscar estatísticas:', statsError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Erro ao buscar estatísticas'
            })
          };
        }
        
        // Calcular estatísticas
        const stats = {
          total_inscricoes: inscricoes.length,
          tipos: {
            judge: inscricoes.filter(i => i.tipo === 'judge').length,
            audiovisual: inscricoes.filter(i => i.tipo === 'audiovisual').length,
            staff: inscricoes.filter(i => i.tipo === 'staff').length
          },
          valor_total: inscricoes.reduce((acc, i) => acc + (i.valor || 0), 0),
          inscricoes_por_mes: {}
        };
        
        // Agrupar por mês
        inscricoes.forEach(inscricao => {
          const data = new Date(inscricao.data_criacao);
          const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
          stats.inscricoes_por_mes[mes] = (stats.inscricoes_por_mes[mes] || 0) + 1;
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: stats
          })
        };

      case 'export':
        // Exportar dados do Supabase
        const { formato = 'json' } = event.queryStringParameters || {};
        
        // Buscar todas as inscrições
        const { data: inscricoesExport, error: exportError } = await supabase
          .from('inscricoes')
          .select('*')
          .order('data_criacao', { ascending: false });
        
        if (exportError) {
          console.error('Erro ao exportar dados:', exportError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Erro ao exportar dados'
            })
          };
        }
        
        let dadosExportados;
        if (formato === 'csv') {
          // Converter para CSV
          const headers = ['ID', 'Nome', 'Email', 'WhatsApp', 'CPF', 'Tipo', 'Valor', 'Status', 'Data Criação'];
          const csvContent = [
            headers.join(','),
            ...inscricoesExport.map(i => [
              i.id,
              `"${i.nome}"`,
              `"${i.email}"`,
              `"${i.whatsapp}"`,
              i.cpf || '',
              i.tipo,
              i.valor || 0,
              i.status,
              i.data_criacao
            ].join(','))
          ].join('\n');
          
          dadosExportados = csvContent;
          headers['Content-Type'] = 'text/csv';
          headers['Content-Disposition'] = 'attachment; filename="inscricoes_interbox_2025.csv"';
        } else {
          dadosExportados = inscricoesExport;
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

    // Atualizar no Supabase
    const { data: inscricaoAtualizada, error: updateError } = await supabase
      .from('inscricoes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Erro ao atualizar inscrição:', updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao atualizar inscrição'
        })
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inscrição atualizada com sucesso',
        inscricao: inscricaoAtualizada
      })
    };
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

    // Remover do Supabase
    const { error: deleteError } = await supabase
      .from('inscricoes')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Erro ao remover inscrição:', deleteError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Erro ao remover inscrição'
        })
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inscrição removida com sucesso'
      })
    };
  } catch (error) {
    console.error('Erro no DELETE:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao remover inscrição' })
    };
  }
};
