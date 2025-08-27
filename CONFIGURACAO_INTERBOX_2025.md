# 🏆 CONFIGURAÇÃO COMPLETA - INTERBØX 2025

## 📅 Data de Implementação
**27 de Agosto de 2025 - 04:20**

## 🎯 Visão Geral
Sistema completo de captação e pagamento para inscrições INTERBØX 2025, integrando frontend React, Netlify Functions e API OpenPix/Woovi.

---

## 🔧 ARQUITETURA DO SISTEMA

### 🏗️ Estrutura de Pastas
```
interbox-captacao/
├── src/
│   ├── components/
│   │   └── CheckoutCard.tsx          # Componente principal de pagamento
│   ├── pages/
│   │   ├── admin/                    # Dashboard administrativo
│   │   ├── audiovisual/              # Página audiovisual
│   │   ├── judge/                    # Página judge
│   │   └── staff/                    # Página staff
│   └── utils/
│       └── database.js               # Sistema de banco JSON
├── netlify/
│   └── functions/
│       ├── create-charge.js          # Criação de charges PIX
│       ├── check-charge.js           # Verificação de status
│       ├── webhook.js                # Webhook OpenPix
│       └── admin-inscricoes.js       # API administrativa
└── data/
    └── inscricoes.json               # Banco de dados JSON
```

---

## 🔑 CONFIGURAÇÕES DE AMBIENTE

### 🌐 Netlify (netlify.toml)
```toml
[build]
  publish = "dist"
  command = "npm run build"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[functions.environment]
  OPENPIX_API_KEY = "Q2xpZW50X0lkX2VhNGNhZGYzLTM0N2YtNDEwYi04MDY0LTQ1MmY3ZTgwYjA4MjpDbGllbnRfU2VjcmV0X2ZLMkk1WFpWam9sd1FKcTMwYXJNdUZ5Qk5ZcG5Md0RwSjljcWdidTJhTWs9"
  OPENPIX_CORP_ID = "d14a8e82-1ab7-4dee-a1a5-6d86c3781ccb"
  API_BASE_URL = "https://api.woovi.com"
  WEBHOOK_URL = "https://interbox-captacao.netlify.app/webhook"
  ADMIN_API_KEY = "interbox2025"
```

### 🔐 Variáveis de Ambiente
```bash
# Frontend (Vite)
VITE_OPENPIX_API_KEY=d14a8e82-1ab7-4dee-a1a5-6d86c3781ccb
VITE_OPENPIX_CORP_ID=d14a8e82-1ab7-4dee-a1a5-6d86c3781ccb
VITE_WEBHOOK_URL=https://interbox-captacao.netlify.app/webhook

# Backend (Netlify Functions)
OPENPIX_API_KEY=Q2xpZW50X0lkX2VhNGNhZGYzLTM0N2YtNDEwYi04MDY0LTQ1MmY3ZTgwYjA4MjpDbGllbnRfU2VjcmV0X2ZLMkk1WFpWam9sd1FKcTMwYXJNdUZ5Qk5ZcG5Md0RwSjljcWdidTJhTWs9
OPENPIX_CORP_ID=d14a8e82-1ab7-4dee-a1a5-6d86c3781ccb
API_BASE_URL=https://api.woovi.com
ADMIN_API_KEY=interbox2025
```

---

## 💳 CONFIGURAÇÕES DE PAGAMENTO

### 📊 Valores por Tipo de Inscrição
```javascript
const PAYMENT_CONFIGS = {
  audiovisual: {
    amount: 2990,        // R$ 29,90
    description: 'Inscrição Audiovisual INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura audiovisual'
  },
  judge: {
    amount: 1990,        // R$ 19,90
    description: 'Inscrição Judge INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura judge'
  },
  staff: {
    amount: 1990,        // R$ 19,90
    description: 'Inscrição Staff INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura staff'
  }
};
```

### 🔄 Estrutura de Dados da API
```javascript
// Resposta da API OpenPix/Woovi
{
  success: true,
  charge: {
    charge: {
      correlationID: "interbox_audiovisual_1756268025427",
      status: "ACTIVE",
      value: 2990,
      brCode: "00020101021226810014br.gov.bcb.pix...",
      qrCodeImage: "https://api.openpix.com.br/openpix/charge/brcode/image/...",
      customer: {
        name: "Teste",
        email: "teste@teste.com",
        phone: "+5511999999999",
        taxID: { taxID: "12345678909", type: "BR:CPF" }
      }
    },
    correlationID: "interbox_audiovisual_1756268025427",
    brCode: "00020101021226810014br.gov.bcb.pix..."
  }
}
```

---

## 🛠️ CORREÇÕES IMPLEMENTADAS

### 1. ❌ Problema: CPF Inválido na API
**Erro**: `"CPF ou CNPJ de cliente inválido"`
**Solução**: Limpeza automática do CPF antes do envio
```javascript
// netlify/functions/create-charge.js
taxID: customerData.cpf ? customerData.cpf.replace(/\D/g, '') : ''
```

### 2. ❌ Problema: QR Code Não Carregava
**Erro**: Mapeamento incorreto dos campos aninhados da API
**Solução**: Correção do mapeamento de dados
```javascript
// src/components/CheckoutCard.tsx
const normalizedData: ChargeResponse = {
  // ... outros campos
  qrCodeImage: charge.qrCodeImage || charge.charge?.qrCodeImage,
  qrCode: charge.qrCodeImage || charge.charge?.qrCodeImage || charge.qrCode,
  brCode: charge.brCode || charge.charge?.brCode,
  status: charge.status || charge.charge?.status
};
```

### 3. ❌ Problema: Logo FlowPay Duplicado
**Erro**: Dois logos aparecendo na interface
**Solução**: Remoção do logo duplicado da seção de pagamento
```javascript
// Removido o segundo logo FlowPay da seção de QR Code
{/* Logo FlowPay centralizado - REMOVIDO */}
```

### 4. ❌ Problema: Dados Não Apareciam no Admin
**Erro**: Sistema de banco não integrado com pagamentos
**Solução**: Sistema híbrido localStorage + servidor
```javascript
// Salvamento automático no localStorage
const inscricaoData = {
  id: `insc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  nome: contactInfo.email.split('@')[0],
  email: contactInfo.email,
  whatsapp: contactInfo.whatsapp,
  cpf: contactInfo.cpf,
  tipo: type,
  valor: type === 'audiovisual' ? 2990 : 1990,
  correlationID: charge.correlationID,
  status: 'pendente',
  data_criacao: new Date().toISOString()
};

localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesExistentes));
```

---

## 🔄 FLUXO DE FUNCIONAMENTO

### 1. 📝 Captura de Dados
```
Usuário acessa /{tipo}/pagar
↓
Preenche formulário de contato
↓
Dados salvos no localStorage
↓
Dados enviados para API OpenPix
```

### 2. 💳 Geração do PIX
```
API OpenPix cria charge
↓
Retorna QR Code + Código PIX
↓
Dados normalizados no frontend
↓
Inscrição salva no localStorage
↓
QR Code exibido na interface
```

### 3. 🔔 Confirmação de Pagamento
```
Webhook recebe confirmação OpenPix
↓
Status atualizado para "confirmado"
↓
Dados salvos no banco JSON
↓
Admin atualiza estatísticas
```

### 4. 📊 Dashboard Administrativo
```
Admin acessa /admin
↓
Carrega dados do localStorage
↓
Tenta sincronizar com servidor
↓
Exibe estatísticas e inscrições
↓
Permite exportação de dados
```

---

## 🧪 TESTES REALIZADOS

### ✅ Rotas Testadas e Funcionando
1. **`/audiovisual/pagar`** - R$ 29,90 ✅
2. **`/judge/pagar`** - R$ 19,90 ✅  
3. **`/staff/pagar`** - R$ 19,90 ✅

### ✅ Funcionalidades Validadas
- [x] Formulário de contato
- [x] Geração de PIX
- [x] QR Code carregando
- [x] Código PIX funcionando
- [x] Salvamento no localStorage
- [x] Integração com admin
- [x] Logs de debug
- [x] Tratamento de erros

---

## 🚀 COMANDOS DE DEPLOY

### 🔨 Build Local
```bash
npm run build
```

### 🚀 Deploy Netlify
```bash
netlify deploy --prod --dir=dist
```

### 📁 Estrutura de Deploy
```
dist/                    # Build de produção
netlify/functions/      # Funções serverless
├── create-charge.js    # Criação de charges
├── check-charge.js     # Verificação de status
├── webhook.js          # Webhook OpenPix
└── admin-inscricoes.js # API administrativa
```

---

## 🔍 LOGS DE DEBUG

### 📱 Console do Frontend
```javascript
// Logs implementados para troubleshooting
console.log('🔍 Dados brutos da API:', data);
console.log('🔍 Charge object:', charge);
console.log('🔍 Dados normalizados:', normalizedData);
console.log('🔍 QR Code URL:', normalizedData.qrCode);
console.log('🔍 PIX Code:', normalizedData.pixCopyPaste);
console.log('✅ QR Code carregado com sucesso:', url);
console.log('✅ Inscrição salva no localStorage:', inscricaoData);
```

### 🌐 Logs do Backend
```javascript
// Logs das Netlify Functions
console.log('🔑 Tentando criar charge via Woovi API:', chargeData);
console.log('✅ Inscrição salva no banco:', inscricaoData);
console.log('❌ Erro ao salvar inscrição:', error);
```

---

## 🎯 DASHBOARD ADMIN

### 🔐 Acesso
- **URL**: `/admin`
- **API Key**: `interbox2025`

### 📊 Funcionalidades
- [x] Visualização de inscrições
- [x] Estatísticas em tempo real
- [x] Filtros por tipo, status e data
- [x] Exportação CSV/Excel
- [x] Remoção de inscrições
- [x] Atualização de status

### 📈 Estatísticas Exibidas
- Total de inscrições
- Contagem por tipo (judge, audiovisual, staff)
- Valor total arrecadado
- Inscrições por mês

---

## ⚠️ PONTOS DE ATENÇÃO

### 🔒 Segurança
- API Key do admin configurada
- Validação de CPF implementada
- Sanitização de dados de entrada

### 🚨 Limitações Conhecidas
- Banco JSON local (não escalável para produção)
- Dependência do localStorage do navegador
- Webhook depende de conectividade OpenPix

### 🔄 Melhorias Futuras
- Migração para banco de dados real
- Sistema de notificações por email
- Dashboard com gráficos avançados
- Integração com sistemas externos

---

## 📞 SUPORTE

### 🐛 Troubleshooting Comum
1. **QR Code não carrega**: Verificar logs do console
2. **PIX não gera**: Verificar variáveis de ambiente
3. **Admin não carrega**: Verificar API Key
4. **Dados não salvam**: Verificar localStorage

### 📋 Checklist de Verificação
- [ ] Variáveis de ambiente configuradas
- [ ] Netlify Functions deployadas
- [ ] Frontend buildado e deployado
- [ ] APIs respondendo corretamente
- [ ] Webhook configurado no OpenPix
- [ ] Admin acessível com API Key

---

## 🏆 STATUS FINAL

**✅ SISTEMA 100% OPERACIONAL**

- **Frontend**: React + Vite funcionando
- **Backend**: Netlify Functions operacionais
- **Pagamentos**: PIX + QR Code funcionando
- **Admin**: Dashboard funcional
- **Integração**: Dados sendo capturados
- **Logs**: Sistema de debug implementado

---

*Documentação criada em 27/08/2025 - Sistema INTERBØX 2025*
*Versão: 1.0.0 - Produção*
