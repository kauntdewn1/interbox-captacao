/**
 * API para Sincronizar Dados Históricos INTERBØX 2025
 * Sincroniza charges existentes da OpenPix/Woovi com o Supabase
 */

import { createClient } from '@supabase/supabase-js';

// 🔗 Configuração Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://ymriypyyirnwctyitcsu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔐 Verificação básica de autenticação
const isAuthorized = (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const apiKey = process.env.ADMIN_API_KEY || 'interbox2025';
  
  return authHeader === `Bearer ${apiKey}`;
};

// 🔧 Função para extrair tipo de inscrição do correlationID
const extractTypeFromCorrelationID = (correlationID) => {
  if (!correlationID) return 'audiovisual'; // Default
  
  const id = correlationID.toLowerCase();
  if (id.includes('audiovisual')) return 'audiovisual';
  if (id.includes('judge')) return 'judge';
  if (id.includes('staff')) return 'staff';
  if (id.includes('interbox')) return 'audiovisual'; // Default para INTERBØX
  return 'audiovisual'; // Default
};

// 🔧 Função para extrair tipo de inscrição do comment
const extractTypeFromComment = (comment) => {
  if (!comment) return 'audiovisual'; // Default
  
  const commentLower = comment.toLowerCase();
  if (commentLower.includes('audiovisual')) return 'audiovisual';
  if (commentLower.includes('judge')) return 'judge';
  if (commentLower.includes('staff')) return 'staff';
  if (commentLower.includes('interbox')) return 'audiovisual'; // Default para INTERBØX
  return 'audiovisual'; // Default
};

// 🔧 Função para buscar charges da OpenPix
const fetchChargesFromOpenPix = async (days = 20) => {
  try {
    const apiKey = process.env.OPENPIX_API_KEY;
    const apiUrl = process.env.API_BASE_URL || 'https://api.woovi.com';
    
    if (!apiKey) {
      throw new Error('OPENPIX_API_KEY não configurada');
    }

    // Calcular data de início (últimos X dias)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateISO = startDate.toISOString();

    console.log(`🔍 Buscando charges desde: ${startDateISO}`);

    // Buscar charges da OpenPix
    const response = await fetch(`${apiUrl}/api/v1/charge?start=${startDateISO}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API OpenPix: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.charges || data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar charges da OpenPix:', error);
    throw error;
  }
};

// 🔧 Função para filtrar charges por tipo de inscrição
const filterInscriptionCharges = (charges) => {
  return charges.filter(charge => {
    const comment = (charge.comment || '').toLowerCase();
    const customerName = (charge.customer?.name || '').toLowerCase();
    const correlationID = (charge.correlationID || '').toLowerCase();
    
    // Filtrar por judge, staff e audiovisual em qualquer coluna
    return comment.includes('judge') || 
           comment.includes('staff') ||
           comment.includes('audiovisual') ||
           customerName.includes('judge') ||
           customerName.includes('staff') ||
           customerName.includes('audiovisual') ||
           correlationID.includes('judge') ||
           correlationID.includes('staff') ||
           correlationID.includes('audiovisual');
  });
};

// 🔧 Função para sincronizar uma charge com o Supabase
const syncChargeToSupabase = async (charge) => {
  try {
    // Determinar tipo de inscrição
    let tipo = extractTypeFromCorrelationID(charge.correlationID);
    if (tipo === 'audiovisual') {
      tipo = extractTypeFromComment(charge.comment);
    }

    // Preparar dados da inscrição
    const inscricaoData = {
      nome: charge.customer?.name || 'Nome não informado',
      email: charge.customer?.email || 'Email não informado',
      whatsapp: charge.customer?.phone || 'WhatsApp não informado',
      cpf: charge.customer?.taxID ? String(charge.customer.taxID).substring(0, 14) : null, // Limitar a 14 caracteres
      tipo: tipo,
      valor: charge.value / 100, // Converter de centavos para reais
      status: charge.status === 'COMPLETED' ? 'pago' : 'pendente',
      correlation_id: charge.correlationID,
      charge_id: charge.identifier || charge.correlationID,
      data_criacao: new Date(charge.createdAt).toISOString(),
      data_confirmacao: charge.status === 'COMPLETED' ? new Date().toISOString() : null
    };

    // Verificar se já existe inscrição com mesmo correlation_id
    const { data: inscricaoExistente, error: checkError } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('correlation_id', charge.correlationID)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
      throw new Error(`Erro ao verificar inscrição existente: ${checkError.message}`);
    }

    if (inscricaoExistente) {
      // Atualizar inscrição existente
      const { data: inscricaoAtualizada, error: updateError } = await supabase
        .from('inscricoes')
        .update({
          status: inscricaoData.status,
          data_confirmacao: inscricaoData.data_confirmacao,
          updated_at: new Date().toISOString()
        })
        .eq('correlation_id', charge.correlationID)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erro ao atualizar inscrição: ${updateError.message}`);
      }

      console.log(`🔄 Inscrição atualizada: ${inscricaoAtualizada.id}`);
      return { action: 'updated', inscricao: inscricaoAtualizada };
    } else {
      // Criar nova inscrição
      const { data: novaInscricao, error: insertError } = await supabase
        .from('inscricoes')
        .insert([inscricaoData])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Erro ao criar inscrição: ${insertError.message}`);
      }

      console.log(`✅ Nova inscrição criada: ${novaInscricao.id}`);
      return { action: 'created', inscricao: novaInscricao };
    }
  } catch (error) {
    console.error(`❌ Erro ao sincronizar charge ${charge.correlationID}:`, error);
    throw error;
  }
};

// 🚀 Handler principal
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  // Configurar CORS para requisições OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

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

    // Parsear parâmetros
    const { days = 20 } = event.queryStringParameters || {};

    console.log(`🔄 Iniciando sincronização histórica dos últimos ${days} dias...`);

    // 1. Buscar charges da OpenPix
    const allCharges = await fetchChargesFromOpenPix(parseInt(days));
    console.log(`📋 Total de charges encontradas: ${allCharges.length}`);

    // 2. Filtrar charges por tipo de inscrição
    const inscriptionCharges = filterInscriptionCharges(allCharges);
    console.log(`🎯 Charges de inscrições (judge/staff/audiovisual): ${inscriptionCharges.length}`);

    if (inscriptionCharges.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Nenhuma charge de inscrição encontrada para sincronizar',
          total_charges: allCharges.length,
          inscription_charges: 0,
          synced: 0,
          created: 0,
          updated: 0
        })
      };
    }

    // 3. Sincronizar cada charge
    let synced = 0;
    let created = 0;
    let updated = 0;
    const errors = [];

    for (const charge of inscriptionCharges) {
      try {
        const result = await syncChargeToSupabase(charge);
        synced++;
        
        if (result.action === 'created') {
          created++;
        } else if (result.action === 'updated') {
          updated++;
        }
      } catch (error) {
        errors.push({
          correlationID: charge.correlationID,
          error: error.message
        });
      }
    }

    console.log(`✅ Sincronização concluída: ${synced} processadas, ${created} criadas, ${updated} atualizadas`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sincronização histórica concluída',
        total_charges: allCharges.length,
        inscription_charges: inscriptionCharges.length,
        synced,
        created,
        updated,
        errors: errors.length > 0 ? errors : undefined
      })
    };

  } catch (error) {
    console.error('❌ Erro na sincronização histórica:', error);
    
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
