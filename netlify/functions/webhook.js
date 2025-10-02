/**
 * Webhook OpenPix/Woovi - INTERBØX 2025
 * Processa pagamentos confirmados via PIX com automações:
 * - Validação HMAC SHA256 (x-openpix-signature)
 * - Split automático FlowPay (10%) + Fornecedor (90%)
 * - Email automático para fornecedor
 * - Atualização de status de pedidos/inscrições
 */

import crypto from 'crypto';
import { createEmailService } from '../../src/services/email.service.ts';
import { createPaymentSplitService } from '../../src/services/payment-split.service.ts';
import productsData from '../../data/products.json';

// 🔐 Validação HMAC SHA256 + base64 (padrão OpenPix/Woovi)
const verifyWebhookSignature = (payload, signature) => {
  const secret = process.env.OPENPIX_HMAC_SECRET;

  if (!secret) {
    console.warn('⚠️ OPENPIX_HMAC_SECRET não configurado - webhook NÃO validado (INSEGURO!)');
    return true; // Permitir temporariamente para não quebrar prod
  }

  if (!signature) {
    console.error('❌ Header x-openpix-signature ausente');
    return false;
  }

  try {
    // OpenPix usa HMAC-SHA256 com digest base64 (não hex!)
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    const expectedSignature = hmac.digest('base64');

    const isValid = expectedSignature === signature;

    if (!isValid) {
      console.error('❌ Assinatura HMAC inválida', {
        received: signature.substring(0, 20) + '...',
        expected: expectedSignature.substring(0, 20) + '...'
      });
    }

    return isValid;
  } catch (error) {
    console.error('❌ Erro ao validar HMAC:', error);
    return false;
  }
};

// 🔧 Função auxiliar para extrair tipo da inscrição
const extractTypeFromCorrelationID = (correlationID) => {
  if (!correlationID) return 'audiovisual'; // Default

  const id = correlationID.toLowerCase();
  if (id.includes('audiovisual')) return 'audiovisual';
  if (id.includes('judge')) return 'judge';
  if (id.includes('staff')) return 'staff';
  if (id.includes('interbox')) return 'audiovisual'; // Default para INTERBØX
  return 'audiovisual'; // Default
};

// 🔧 Função auxiliar para detectar se é venda de produto
const isProductSale = (correlationID) => {
  if (!correlationID) return false;
  return correlationID.toLowerCase().includes('prod_');
};

// 🔧 Função auxiliar para extrair dados do produto da correlationID
const extractProductData = (correlationID) => {
  if (!correlationID) return null;
  
  // Formato: interbox_prod_{slug}_{timestamp}
  const parts = correlationID.split('_');
  if (parts.length >= 3 && parts[1] === 'prod') {
    return {
      slug: parts[2],
      timestamp: parts[3] || Date.now()
    };
  }
  return null;
};

export const handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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

    // Parsear dados do webhook
    const webhookData = JSON.parse(event.body);

    // 🔐 VALIDAR ASSINATURA HMAC (Segurança)
    const signature = event.headers['x-openpix-signature'];

    if (!verifyWebhookSignature(webhookData, signature)) {
      console.error('❌ Webhook rejeitado: assinatura HMAC inválida');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid HMAC signature'
        })
      };
    }

    console.log('✅ Webhook OpenPix autenticado via HMAC');

    // Log do webhook recebido
    console.log('Webhook OpenPix recebido:', JSON.stringify(webhookData, null, 2));

    // Verificar se é uma notificação de pagamento
    if (webhookData.event === 'OPENPIX:TRANSACTION_RECEIVED') {
      const { transaction } = webhookData;
      
      console.log(`Pagamento PIX recebido: ${transaction.correlationID}`);
      console.log(`Valor: R$ ${(transaction.value / 100).toFixed(2)}`);
      console.log(`End-to-End ID: ${transaction.transactionEndToEndId}`);
      
      // Verificar se é venda de produto ou inscrição
      if (isProductSale(transaction.correlationID)) {
        // 🛍️ VENDA DE PRODUTO - Fluxo completo com automações
        try {
          const productData = extractProductData(transaction.correlationID);
          const findInfo = (key) => transaction.additionalInfo?.find(info => info.key === key)?.value;

          // 1. Salvar venda via save-order.js
          const orderData = {
            produto_id: productData?.slug || 'produto-desconhecido',
            cliente_email: transaction.customer?.email || 'cliente@interbox.com',
            cor: findInfo('cor') || 'Não informado',
            tamanho: findInfo('tamanho') || 'Não informado',
            valor: transaction.value,
            correlation_id: transaction.correlationID,
            charge_id: transaction.correlationID
          };

          const response = await fetch(`${process.env.URL || 'https://interbox-captacao.netlify.app'}/.netlify/functions/save-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Venda de produto salva:', result.order_id);
          } else {
            console.error('❌ Erro ao salvar venda de produto');
          }

          // 2. Buscar produto para enriquecimento
          const product = productsData.find(
            (p) => p.id === productData?.slug || p.slug === productData?.slug
          );

          if (product) {
            // 3. 💸 EXECUTAR SPLIT AUTOMÁTICO (10% FlowPay + 90% PlayK)
            try {
              console.log('💰 Iniciando split automático de pagamento...');
              const splitService = createPaymentSplitService();

              const splitResult = await splitService.processSplitForOrder(
                transaction.transactionEndToEndId || transaction.correlationID,
                transaction.value,
                {
                  correlationID: transaction.correlationID,
                  productId: product.id,
                  category: product.categoria || 'vestuario'
                }
              );

              if (splitResult.success) {
                console.log('✅ Split executado com sucesso:');
                splitResult.splits.forEach((split) => {
                  console.log(`   ${split.recipient}: R$ ${(split.amount / 100).toFixed(2)}`);
                });
              } else {
                console.error('⚠️ Split executado parcialmente:', splitResult.errors);
              }
            } catch (error) {
              console.error('❌ Erro ao executar split (não bloqueante):', error);
            }

            // 4. 📧 ENVIAR EMAIL AUTOMÁTICO PARA FORNECEDOR
            try {
              console.log('📧 Enviando email automático para fornecedor...');
              const emailService = createEmailService();

              const extractGender = (prod) => {
                if (prod.nome.toLowerCase().includes('feminina')) return 'Feminino';
                if (prod.nome.toLowerCase().includes('masculina')) return 'Masculino';
                return 'Unissex';
              };

              const emailData = {
                produto: product.nome,
                produto_id: product.id,
                categoria: product.categoria || 'vestuario',
                genero: extractGender(product),
                valor: transaction.value,
                cliente: {
                  nome: transaction.customer?.name || 'Cliente',
                  email: transaction.customer?.email || '',
                  telefone: transaction.customer?.phone || '',
                  cpf: transaction.customer?.taxID || ''
                },
                tamanho: findInfo('tamanho') || '',
                cor: findInfo('cor') || '',
                correlationID: transaction.correlationID,
                data_pedido: new Date().toISOString()
              };

              const emailResult = await emailService.sendOrderEmail(emailData, 'contatoplayk@gmail.com');

              if (emailResult.success) {
                console.log('✅ Email enviado para fornecedor:', emailResult.id);
              } else {
                console.error('⚠️ Erro ao enviar email (não bloqueante):', emailResult.error);
              }
            } catch (error) {
              console.error('❌ Erro ao processar email (não bloqueante):', error);
            }
          } else {
            console.warn('⚠️ Produto não encontrado no catálogo:', productData?.slug);
          }

        } catch (error) {
          console.error('❌ Erro ao processar venda de produto:', error);
        }

        // 🔄 ATUALIZAR PEDIDO PENDING PARA PAID
        try {
          const { createStorage } = await import('../../src/utils/storage.ts');
          const storage = await createStorage();
          const orders = (await storage.read('orders.json')) || [];
          
          const { product_slug, customer = {}, txid, identifier, correlationID, additionalInfo = [] } = transaction;
          const findInfo = (k) => (additionalInfo || []).find(i => i.key === k)?.value;
          
          const idx = orders.findIndex(o =>
            (identifier && o.identifier === identifier) ||
            (correlationID && o.correlationID === correlationID) ||
            (txid && o.txid === txid) ||
            (product_slug && o.product_slug === product_slug && o.customer?.email === (customer.email||'').toLowerCase())
          );

          if (idx >= 0) {
            orders[idx].status = 'paid';
            orders[idx].txid = txid || orders[idx].txid || `tx_${Date.now()}`;
            orders[idx].paid_at = new Date().toISOString();
            orders[idx].origin = orders[idx].origin || findInfo('origin') || 'site-interbox';
            orders[idx].tag = orders[idx].tag || findInfo('tag') || 'default';
            await storage.write('orders.json', orders);
            console.log('✅ Pedido pending atualizado para paid:', orders[idx].id);
          }
        } catch (e) {
          console.warn('⚠️ Erro ao atualizar pedido pending:', e?.message);
        }
      } else {
        // 📝 INSCRIÇÃO - Atualizar via update-inscricao.js
        try {
          const updateData = {
            email: transaction.customer?.email || 'Email não informado',
            tipo: extractTypeFromCorrelationID(transaction.correlationID),
            status: 'pago',
            data_confirmacao: new Date().toISOString(),
            correlationID: transaction.correlationID,
            charge_id: transaction.correlationID
          };
          
          const response = await fetch(`${process.env.URL || 'https://interbox-captacao.netlify.app'}/.netlify/functions/update-inscricao`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer interbox2025'
            },
            body: JSON.stringify(updateData)
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Inscrição atualizada para pago:', result.inscricao?.id);
          } else {
            console.error('❌ Erro ao atualizar inscrição para pago');
          }
        } catch (error) {
          console.error('Erro ao atualizar inscrição para pago:', error);
        }
      }
    }

    // Sempre retornar sucesso para o webhook
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Webhook processado com sucesso' 
      })
    };

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    // Mesmo com erro, retornar 200 para evitar reenvios
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Erro interno, mas webhook aceito' 
      })
    };
  }
};
