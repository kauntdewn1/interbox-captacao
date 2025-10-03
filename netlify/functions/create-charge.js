/**
 * Netlify Function para criar charges OpenPix/Woovi
 * Implementa lógica de pagamento para INTERBØX 2025
 */

import './_shared/fix-util-extend.js';
import { withCors, jsonResponse } from './_shared/cors.ts';
import productsData from "../../data/products.json";

// 🔑 Configurações de pagamento
const PAYMENT_CONFIGS = {
  audiovisual: {
    amount: 2990, // R$ 29,90
    description: 'Inscrição Audiovisual INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura audiovisual'
  },
  judge: {
    amount: 1990, // R$ 19,90
    description: 'Inscrição Judge INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura judge'
  },
  staff: {
    amount: 1990, // R$ 19,90
    description: 'Inscrição Staff INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura staff'
  },
};

// 🏷️ Função para gerar tags de categorização
const generateProductTags = (product) => {
  const tags = ['INTERBOX', 'ECOMMERCE'];

  // Detectar categoria do produto
  if (product.nome.toLowerCase().includes('camiseta') || product.slug.includes('camiseta')) {
    tags.push('CAMISETA');
  } else if (product.nome.toLowerCase().includes('cropped') || product.slug.includes('cropped')) {
    tags.push('CROPPED');
  } else if (product.nome.toLowerCase().includes('top')) {
    tags.push('TOP');
  } else if (product.categoria) {
    tags.push(product.categoria.toUpperCase());
  }

  // Detectar gênero
  if (product.nome.toLowerCase().includes('feminina') || product.slug.includes('feminina')) {
    tags.push('FEMININO');
  } else if (product.nome.toLowerCase().includes('masculina') || product.slug.includes('masculina')) {
    tags.push('MASCULINO');
  } else if (product.nome.toLowerCase().includes('unissex')) {
    tags.push('UNISSEX');
  }

  return tags.join(', ');
};

// 🔧 Função para criar charge via OpenPix/Woovi
const createOpenPixCharge = async (paymentData) => {
  const apiKey = process.env.OPENPIX_API_KEY?.trim();
  const apiUrl = process.env.API_BASE_URL || 'https://api.woovi.com';

  if (!apiKey) {
    throw new Error('OPENPIX_API_KEY não configurada');
  }

  try {
    const chargeData = {
      correlationID: paymentData.correlationID,
      value: paymentData.value,
      comment: paymentData.comment,
      customer: paymentData.customer,
      additionalInfo: paymentData.additionalInfo
    };

    console.log('🔑 Tentando criar charge via Woovi API:', {
      url: `${apiUrl}/api/v1/charge`,
      apiKey: apiKey ? 'Configurada' : 'NÃO CONFIGURADA',
      data: chargeData
    });

    const response = await fetch(`${apiUrl}/api/v1/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify(chargeData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenPix API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar charge OpenPix:', error);
    throw error;
  }
};

// 🚀 Handler principal da Netlify Function
export const handler = withCors(async (event) => {
  // Verificar se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  try {
    // Parsear dados da requisição
    const body = JSON.parse(event.body);
    const { type, customerData, productId, productSlug, tag, origin } = body;

    // Determinar se é compra de produto (catálogo) ou inscrição
    const isProductFlow = Boolean(productId || productSlug);

    // Validar fluxo de inscrição quando não for produto
    if (!isProductFlow && !PAYMENT_CONFIGS[type]) {
      return jsonResponse(400, {
        error: 'Tipo de pagamento inválido',
        validTypes: Object.keys(PAYMENT_CONFIGS)
      });
    }

    // Validar dados do cliente
    if (!customerData || !customerData.name || !customerData.email) {
      return jsonResponse(400, {
        error: 'Dados do cliente obrigatórios: name e email'
      });
    }

    // Configuração do pagamento
    let config;
    let chargeData;

    if (isProductFlow) {
      // Carregar produto do catálogo JSON
      const products = productsData;

      const product = products.find(
        (p) => p.id === productId || p.slug === productSlug || p.slug === productId
      );

      if (!product) {
        return jsonResponse(404, { error: 'Produto não encontrado' });
      }

      const amountInCents = Math.round(Number(product.preco) * 100);
      config = {
        amount: amountInCents,
        description: `${product.nome} - INTERBØX`,
        comment: `Compra produto: ${product.nome}`
      };

      // Gerar tags automáticas do produto
      const productTags = generateProductTags(product);

      chargeData = {
        correlationID: `interbox_prod_${product.slug || product.id}_${Date.now()}`,
        value: config.amount,
        comment: config.comment,
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || '',
          taxID: customerData.cpf ? customerData.cpf.replace(/\D/g, '') : ''
        },
        additionalInfo: [
          { key: 'event', value: 'INTERBØX 2025' },
          { key: 'flow', value: 'product' },
          { key: 'product_id', value: product.id },
          { key: 'product_slug', value: product.slug },
          { key: 'product_name', value: product.nome },
          { key: 'tags', value: productTags }, // ← TAGS: INTERBOX, ECOMMERCE, CAMISETA, MASCULINO/FEMININO
          { key: 'category', value: product.categoria || 'vestuario' },
          { key: 'subcategory', value: product.subcategoria || '' },
          { key: 'origin', value: String(origin || 'site-interbox') },
          { key: 'campaign_tag', value: String(tag || 'organic') }
        ]
      };
    } else {
      config = PAYMENT_CONFIGS[type];
      chargeData = {
        correlationID: `interbox_${type}_${Date.now()}`,
        value: config.amount,
        comment: config.comment,
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || '',
          taxID: customerData.cpf ? customerData.cpf.replace(/\D/g, '') : ''
        },
        additionalInfo: [
          { key: 'event', value: 'INTERBØX 2025' },
          { key: 'type', value: type },
          { key: 'customer_id', value: customerData.email }
        ]
      };
    }

    try {
      console.log('🚀 Iniciando criação de charge:', {
        isProductFlow,
        productId,
        productSlug,
        type,
        correlationID: chargeData.correlationID
      });

      // Tentar criar charge via OpenPix/Woovi
      const charge = await createOpenPixCharge(chargeData);

      // Salva 'pending' para possibilitar polling
      try {
        const { createStorage } = await import('../../src/utils/storage.ts');
        const storage = await createStorage();
        const orders = (await storage.read('orders.json')) || [];
        const info = (charge?.charge?.additionalInfo || []);
        const findInfo = (k) => info.find(i => i.key === k)?.value;
        const pendingOrder = {
          id: `ord_${Date.now()}`,
          status: 'pending',
          amount_cents: charge?.charge?.value,
          correlationID: chargeData.correlationID,
          identifier: charge?.charge?.identifier,
          product_id: findInfo('product_id'),
          product_slug: findInfo('product_slug'),
          origin: findInfo('origin') || 'site-interbox',
          tag: findInfo('tag') || 'default',
          customer: { email: customerData.email, name: customerData.name },
          created_at: new Date().toISOString()
        };
        // Evitar duplicatas por identifier OU correlationID
        const dedupeKey = pendingOrder.identifier || pendingOrder.correlationID;
        const exists = dedupeKey
          ? orders.some(o => (o.identifier || o.correlationID) === dedupeKey)
          : false;
        if (!exists) {
          orders.push(pendingOrder);
          await storage.write('orders.json', orders);
        }
      } catch (e) {
        console.warn('Não consegui salvar pending order (ok continuar):', e?.message);
      }

      console.log('✅ Charge criado com sucesso:', {
        correlationID: charge.correlationID,
        status: charge.status,
        hasQRCode: !!charge.qrCode,
        hasPixCode: !!charge.pixCopyPaste
      });

      // Registro local para observabilidade
      try {
        const meta = {
          nome: customerData.name,
          email: customerData.email,
          whatsapp: customerData.phone,
          cpf: customerData.cpf,
          fluxo: isProductFlow ? 'produto' : 'inscricao',
          tipo_ou_produto: isProductFlow ? (productId || productSlug) : type,
          valor: chargeData.value,
          correlationID: chargeData.correlationID,
          status: 'pendente',
          charge_id: charge.identifier || charge.correlationID,
          data_criacao: new Date().toISOString()
        };
        console.log('✅ Metadados de criação de charge:', meta);
      } catch {}

      return jsonResponse(200, {
        success: true,
        charge: charge,
        qrCode: charge?.charge?.qrCodeImage || charge?.qrCode,
        pixCopyPaste: charge?.brCode || charge?.pixCopyPaste,
        fallback: false,
        message: 'Pagamento processado com sucesso'
      });
    } catch (apiError) {
      console.error('❌ Erro na API OpenPix:', apiError.message);

      return jsonResponse(500, {
        success: false,
        error: 'Erro na API OpenPix',
        message: apiError.message
      });
    }

  } catch (error) {
    console.error('❌ Erro ao processar criação de charge:', error);

    return jsonResponse(500, {
      success: false,
      error: 'Erro interno do servidor',
      message: error.message || 'Erro desconhecido',
      stack: error.stack || null
    });
  }
});
