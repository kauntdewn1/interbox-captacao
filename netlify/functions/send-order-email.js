/**
 * Netlify Function - Send Order Email
 * Envia email automático de novo pedido para fornecedor
 */

import './_shared/fix-util-extend.js';
import { withCors, jsonResponse } from './_shared/cors.ts';
import { createEmailService } from '../../src/services/email.service.ts';
import productsData from '../../data/products.json';

/**
 * Extrai gênero do produto baseado em tags, nome ou slug
 */
const extractGender = (product) => {
  if (product.nome.toLowerCase().includes('feminina') || product.slug.includes('feminina')) {
    return 'Feminino';
  }
  if (product.nome.toLowerCase().includes('masculina') || product.slug.includes('masculina')) {
    return 'Masculino';
  }
  if (product.nome.toLowerCase().includes('unissex') || product.tags?.includes('unissex')) {
    return 'Unissex';
  }
  return 'Unissex';
};

/**
 * Handler principal
 */
export const handler = withCors(async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  try {
    const body = JSON.parse(event.body);
    const {
      correlationID,
      productId,
      customer,
      amount,
      size,
      color,
      address,
      notes,
      supplierEmail = 'contatoplayk@gmail.com'
    } = body;

    // Validações
    if (!correlationID || !productId || !customer || !amount) {
      return jsonResponse(400, {
        error: 'Campos obrigatórios: correlationID, productId, customer, amount',
      });
    }

    if (!customer.name || !customer.email) {
      return jsonResponse(400, {
        error: 'Dados do cliente obrigatórios: name, email',
      });
    }

    // Buscar produto
    const product = productsData.find(
      (p) => p.id === productId || p.slug === productId
    );

    if (!product) {
      return jsonResponse(404, { error: 'Produto não encontrado' });
    }

    // Preparar dados do email
    const emailData = {
      produto: product.nome,
      produto_id: product.id,
      categoria: product.categoria || 'vestuario',
      genero: extractGender(product),
      valor: amount,
      cliente: {
        nome: customer.name,
        email: customer.email,
        telefone: customer.phone || '',
        cpf: customer.cpf || '',
      },
      endereco: address || undefined,
      tamanho: size || '',
      cor: color || '',
      observacoes: notes || '',
      correlationID,
      data_pedido: new Date().toISOString(),
    };

    // Criar service e enviar email
    const emailService = createEmailService();

    console.log('📧 Enviando email de pedido para:', supplierEmail);

    const result = await emailService.sendOrderEmail(emailData, supplierEmail);

    if (!result.success) {
      console.error('❌ Erro ao enviar email:', result.error);
      return jsonResponse(500, {
        success: false,
        error: 'Erro ao enviar email',
        details: result.error,
      });
    }

    console.log('✅ Email enviado com sucesso:', result.id);

    // Opcional: Enviar confirmação para cliente
    try {
      await emailService.sendCustomerConfirmationEmail(emailData);
      console.log('✅ Email de confirmação enviado para cliente');
    } catch (error) {
      console.warn('⚠️ Erro ao enviar email para cliente (não bloqueante):', error);
    }

    return jsonResponse(200, {
      success: true,
      message: 'Email enviado com sucesso',
      emailId: result.id,
    });

  } catch (error) {
    console.error('❌ Erro ao processar envio de email:', error);

    return jsonResponse(500, {
      success: false,
      error: 'Erro interno do servidor',
      message: error.message || 'Erro desconhecido',
    });
  }
});
