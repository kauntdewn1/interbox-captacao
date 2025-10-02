/**
 * Email Service - INTERBØX 2025
 *
 * Service para envio de emails transacionais via Resend
 * Suporta múltiplos templates e destinatários
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface OrderEmailData {
  produto: string;
  produto_id: string;
  categoria: string;
  genero: 'Masculino' | 'Feminino' | 'Unissex';
  valor: number;
  cliente: {
    nome: string;
    email: string;
    telefone?: string;
    cpf?: string;
  };
  endereco?: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  tamanho?: string;
  cor?: string;
  observacoes?: string;
  correlationID: string;
  data_pedido: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailOptions {
  to: EmailAddress | EmailAddress[];
  from?: EmailAddress;
  subject: string;
  html: string;
  text?: string;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailServiceConfig {
  apiKey: string;
  defaultFrom: EmailAddress;
  providers: {
    resend?: boolean;
    nodemailer?: boolean;
  };
}

// ============================================================================
// Email Templates
// ============================================================================

/**
 * Template de email de novo pedido para fornecedor
 */
export const orderEmailTemplate = (data: OrderEmailData): EmailTemplate => {
  const valorFormatado = (data.valor / 100).toFixed(2);
  const dataFormatada = new Date(data.data_pedido).toLocaleString('pt-BR');

  const enderecoHtml = data.endereco
    ? `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
        <h3 style="color: #495057; margin-top: 0;">📍 Endereço de Entrega</h3>
        <p style="margin: 5px 0;">${data.endereco.rua}, ${data.endereco.numero}</p>
        ${data.endereco.complemento ? `<p style="margin: 5px 0;">${data.endereco.complemento}</p>` : ''}
        <p style="margin: 5px 0;">${data.endereco.bairro} - ${data.endereco.cidade}/${data.endereco.estado}</p>
        <p style="margin: 5px 0;">CEP: ${data.endereco.cep}</p>
      </div>
    `
    : '<p style="color: #dc3545;">⚠️ Endereço não informado</p>';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Pedido - INTERBØX 2025</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🛍️ Novo Pedido!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">INTERBØX 2025 - PlayK</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 12px 12px;">

    <div style="background: #e7f3ff; padding: 15px; border-left: 4px solid #0066cc; border-radius: 4px; margin-bottom: 25px;">
      <p style="margin: 0; color: #0066cc; font-weight: 600;">✅ Pagamento confirmado via PIX</p>
    </div>

    <h2 style="color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 10px;">📦 Detalhes do Produto</h2>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Produto:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${data.produto}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Categoria:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${data.categoria}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Gênero:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${data.genero}</td>
      </tr>
      ${data.tamanho ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Tamanho:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${data.tamanho}</td>
      </tr>
      ` : ''}
      ${data.cor ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Cor:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${data.cor}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Valor:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; color: #28a745; font-size: 18px; font-weight: 600;">R$ ${valorFormatado}</td>
      </tr>
    </table>

    <h2 style="color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 10px; margin-top: 30px;">👤 Dados do Cliente</h2>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Nome:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${data.cliente.nome}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>E-mail:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${data.cliente.email}</td>
      </tr>
      ${data.cliente.telefone ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>Telefone:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${data.cliente.telefone}</td>
      </tr>
      ` : ''}
      ${data.cliente.cpf ? `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;"><strong>CPF:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">${data.cliente.cpf}</td>
      </tr>
      ` : ''}
    </table>

    ${enderecoHtml}

    ${data.observacoes ? `
    <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin-top: 20px;">
      <h3 style="color: #856404; margin-top: 0;">💬 Observações do Cliente</h3>
      <p style="margin: 0; color: #856404;">${data.observacoes}</p>
    </div>
    ` : ''}

    <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <p style="margin: 0; font-size: 12px; color: #6c757d;"><strong>ID do Pedido:</strong> ${data.correlationID}</p>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #6c757d;"><strong>Data:</strong> ${dataFormatada}</p>
    </div>

    <div style="margin-top: 30px; padding: 20px; background: #e7f3ff; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #0066cc; font-size: 14px;">
        📊 Acesse o <strong>Painel do Fornecedor</strong> para ver mais detalhes
      </p>
      <a href="https://interbox-captacao.netlify.app/fornecedor"
         style="display: inline-block; margin-top: 15px; padding: 12px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Ver Painel
      </a>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
    <p style="margin: 0;">INTERBØX 2025 - Maior evento fitness de times da América Latina</p>
    <p style="margin: 5px 0 0 0;">Dúvidas? Entre em contato: <a href="mailto:contato@interbox.com.br" style="color: #667eea;">contato@interbox.com.br</a></p>
  </div>

</body>
</html>
  `;

  const text = `
🛍️ NOVO PEDIDO - INTERBØX 2025

✅ Pagamento confirmado via PIX

📦 PRODUTO
Produto: ${data.produto}
Categoria: ${data.categoria}
Gênero: ${data.genero}
${data.tamanho ? `Tamanho: ${data.tamanho}` : ''}
${data.cor ? `Cor: ${data.cor}` : ''}
Valor: R$ ${valorFormatado}

👤 CLIENTE
Nome: ${data.cliente.nome}
E-mail: ${data.cliente.email}
${data.cliente.telefone ? `Telefone: ${data.cliente.telefone}` : ''}
${data.cliente.cpf ? `CPF: ${data.cliente.cpf}` : ''}

${data.endereco ? `
📍 ENDEREÇO DE ENTREGA
${data.endereco.rua}, ${data.endereco.numero}
${data.endereco.complemento || ''}
${data.endereco.bairro} - ${data.endereco.cidade}/${data.endereco.estado}
CEP: ${data.endereco.cep}
` : '⚠️ Endereço não informado'}

${data.observacoes ? `💬 OBSERVAÇÕES\n${data.observacoes}\n` : ''}

ID do Pedido: ${data.correlationID}
Data: ${dataFormatada}

--
INTERBØX 2025
Acesse o Painel do Fornecedor: https://interbox-captacao.netlify.app/fornecedor
  `;

  return {
    subject: `🛍️ Novo Pedido: ${data.produto} - R$ ${valorFormatado}`,
    html,
    text,
  };
};

// ============================================================================
// Email Service Class
// ============================================================================

export class EmailService {
  private config: EmailServiceConfig;

  constructor(config?: Partial<EmailServiceConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.RESEND_API_KEY || '',
      defaultFrom: config?.defaultFrom || {
        email: 'pedidos@interbox.com.br',
        name: 'INTERBØX 2025',
      },
      providers: config?.providers || {
        resend: true,
        nodemailer: false,
      },
    };

    if (!this.config.apiKey) {
      console.warn('⚠️ EmailService: API Key não configurada');
    }
  }

  /**
   * Envia email usando Resend API
   */
  async sendWithResend(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          from: options.from
            ? `${options.from.name} <${options.from.email}>`
            : `${this.config.defaultFrom.name} <${this.config.defaultFrom.email}>`,
          to: Array.isArray(options.to)
            ? options.to.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email))
            : options.to.name
            ? `${options.to.name} <${options.to.email}>`
            : options.to.email,
          subject: options.subject,
          html: options.html,
          text: options.text,
          cc: options.cc?.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email)),
          bcc: options.bcc?.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email)),
          reply_to: options.replyTo
            ? options.replyTo.name
              ? `${options.replyTo.name} <${options.replyTo.email}>`
              : options.replyTo.email
            : undefined,
          tags: options.tags,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return { success: true, id: data.id };
    } catch (error) {
      console.error('❌ Erro ao enviar email via Resend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Envia email genérico
   */
  async send(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    if (this.config.providers.resend) {
      return this.sendWithResend(options);
    }

    throw new Error('Nenhum provider de email configurado');
  }

  /**
 * Envia email de novo pedido para fornecedor
 */
async sendOrderEmail(
  orderData: OrderEmailData,
  supplierEmail: string = 'contatoplayk@gmail.com'
): Promise<{ success: boolean; id?: string; error?: string }> {
  const valorFormatado = (orderData.valor / 100).toFixed(2);

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novo Pedido - INTERBØX 2025</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 26px;">📥 Novo Pedido Recebido</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">INTERBØX 2025</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px;">Você recebeu um novo pedido de <strong>${orderData.cliente.nome}</strong>.</p>

    <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #333; margin-top: 0;">🛒 Detalhes do Pedido</h2>
      <p><strong>Produto:</strong> ${orderData.produto}</p>
      ${orderData.tamanho ? `<p><strong>Tamanho:</strong> ${orderData.tamanho}</p>` : ''}
      ${orderData.cor ? `<p><strong>Cor:</strong> ${orderData.cor}</p>` : ''}
      <p><strong>Valor:</strong> R$ ${valorFormatado}</p>
    </div>

    <h3 style="margin-top: 30px;">📍 Endereço</h3>
    <p>${orderData.endereco}</p>

    ${orderData.observacoes ? `<p><strong>Observações:</strong> ${orderData.observacoes}</p>` : ''}

    <div style="margin-top: 30px;">
      <a href="https://interbox-captacao.netlify.app/fornecedor" target="_blank" style="display: inline-block; padding: 12px 20px; background: #6a11cb; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">📊 Acessar Dashboard</a>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
    <p style="margin: 0;">INTERBØX 2025 - Pedido via Pix</p>
  </div>

</body>
</html>
`;

  return this.send({
    to: { email: supplierEmail, name: 'PlayK' },
    subject: `📥 Novo Pedido Recebido - ${orderData.produto}`,
    html,
    tags: [
      { name: 'type', value: 'order' },
      { name: 'supplier', value: 'playk' },
      { name: 'product', value: orderData.produto_id },
      { name: 'category', value: orderData.genero.toLowerCase() },
    ],
  });
}
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Cria instância do EmailService com configuração padrão
 */
export const createEmailService = (config?: Partial<EmailServiceConfig>): EmailService => {
  return new EmailService(config);
};

/**
 * Helper para envio rápido de email de pedido
 */
export const sendOrderNotification = async (
  orderData: OrderEmailData,
  supplierEmail: string = 'contatoplayk@gmail.com'
): Promise<{ success: boolean; id?: string; error?: string }> => {
  const emailService = createEmailService();
  return emailService.sendOrderEmail(orderData, supplierEmail);
};
