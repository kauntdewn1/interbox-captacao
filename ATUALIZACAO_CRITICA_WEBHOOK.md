# 🚨 ATUALIZAÇÃO CRÍTICA: Webhook OpenPix

## 📅 Data: Outubro 2025

## 🎯 Mudanças Implementadas

### 1. ✅ Nova URL do Webhook

**Antes (Obsoleto):**
```
❌ https://interbox-captacao.netlify.app/.netlify/functions/webhook
```

**Agora (Atual):**
```
✅ https://interbox-captacao.netlify.app/webhook
```

**Configurado em:** Dashboard OpenPix/Woovi

---

### 2. ✅ Validação HMAC SHA256 + base64

**Implementado em:** `netlify/functions/webhook.js`

```javascript
import crypto from 'crypto';

const verifyWebhookSignature = (payload, signature) => {
  const secret = process.env.OPENPIX_HMAC_SECRET;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('base64'); // ← base64, não hex!

  return expectedSignature === signature;
};
```

**Header verificado:** `x-openpix-signature`

---

### 3. ✅ Nova Variável de Ambiente

**Adicionada:**
```bash
OPENPIX_HMAC_SECRET=openpix_xxxxxxxxxx/Qfc=
```

**Onde obter:**
- Dashboard Woovi → Webhooks → (ao criar/editar webhook)
- Exibido apenas 1 vez, copiar imediatamente!

**Removidas (obsoletas):**
```bash
❌ OPENPIX_API_URL=...          # URL fixa, não necessária
❌ OPENPIX_WEBHOOK_TOKEN=...    # Substituída por HMAC
```

---

## 🔧 Configuração do Redirect

**Arquivo:** `netlify.toml:6-9`

```toml
[[redirects]]
  from = "/webhook"
  to = "/.netlify/functions/webhook"
  status = 200
  force = true
```

**Como funciona:**
1. OpenPix envia POST para: `https://interbox-captacao.netlify.app/webhook`
2. Netlify redireciona internamente para: `/.netlify/functions/webhook`
3. Function processa com validação HMAC
4. Retorna 200 (sucesso) ou 401 (HMAC inválido)

---

## 🧪 Como Testar

### Teste 1: Verificar Redirect

```bash
curl -I https://interbox-captacao.netlify.app/webhook
```

**Esperado:**
```
HTTP/2 200
x-nf-request-id: ...
```

### Teste 2: Webhook com HMAC Válido

```bash
# Gerar assinatura
SECRET="openpix_seu_secret_aqui"
PAYLOAD='{"event":"OPENPIX:TRANSACTION_RECEIVED","transaction":{"correlationID":"test"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64)

# Enviar
curl -X POST https://interbox-captacao.netlify.app/webhook \
  -H "Content-Type: application/json" \
  -H "x-openpix-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**Esperado:** `200 OK` com log `✅ Webhook OpenPix autenticado via HMAC`

### Teste 3: Webhook com HMAC Inválido

```bash
curl -X POST https://interbox-captacao.netlify.app/webhook \
  -H "Content-Type: application/json" \
  -H "x-openpix-signature: assinatura_falsa" \
  -d '{"event":"TEST"}'
```

**Esperado:** `401 Unauthorized` com `Invalid HMAC signature`

---

## 📋 Checklist de Implantação

### ✅ Já Feito

- [x] Implementar validação HMAC no webhook.js
- [x] Configurar redirect `/webhook` no netlify.toml
- [x] Atualizar `.env.example` com OPENPIX_HMAC_SECRET
- [x] Documentar migração HMAC
- [x] Remover referências a OPENPIX_API_URL

### ⏳ Pendente (Fazer HOJE)

- [ ] Obter `OPENPIX_HMAC_SECRET` do dashboard Woovi
- [ ] Adicionar `OPENPIX_HMAC_SECRET` no `.env` local
- [ ] Configurar no Netlify:
  ```bash
  netlify env:set OPENPIX_HMAC_SECRET "openpix_seu_secret_aqui"
  ```
- [ ] Atualizar URL do webhook no dashboard Woovi para:
  ```
  https://interbox-captacao.netlify.app/webhook
  ```
- [ ] Testar webhook com transação real
- [ ] Monitorar logs nas primeiras 24h

---

## 🔍 Verificação Pós-Deploy

### Logs Esperados (Sucesso)

```
✅ Webhook OpenPix autenticado via HMAC
Webhook OpenPix recebido: { "event": "OPENPIX:TRANSACTION_RECEIVED", ... }
💰 Iniciando split automático de pagamento...
✅ Split executado com sucesso:
   FlowPay: R$ 13.99
   PlayK: R$ 125.91
📧 Enviando email automático para fornecedor...
✅ Email enviado para fornecedor: re_abc123
```

### Logs de Erro (Ação Necessária)

**Erro 1: HMAC Secret não configurado**
```
⚠️ OPENPIX_HMAC_SECRET não configurado - webhook NÃO validado (INSEGURO!)
```
**Ação:** Adicionar `OPENPIX_HMAC_SECRET` no Netlify

**Erro 2: Assinatura inválida**
```
❌ Assinatura HMAC inválida
received: iAq3nD9xKl2P+8Zt...
expected: zY8wV2bM5nA1cR4k...
```
**Ação:** Verificar se secret está correto, pode ter sido rotacionado

**Erro 3: Header ausente**
```
❌ Header x-openpix-signature ausente
```
**Ação:** Verificar configuração do webhook no dashboard Woovi

---

## 🔐 Segurança

### Antes (Inseguro)
```javascript
// ❌ Qualquer requisição era aceita
export const handler = async (event) => {
  const webhookData = JSON.parse(event.body);
  // Processar sem validação...
};
```

**Riscos:**
- Atacante pode enviar webhooks falsos
- Possível criar transações fictícias
- Zero garantia de origem

### Depois (Seguro)
```javascript
// ✅ Apenas requisições autenticadas da OpenPix
export const handler = async (event) => {
  const webhookData = JSON.parse(event.body);
  const signature = event.headers['x-openpix-signature'];

  if (!verifyWebhookSignature(webhookData, signature)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  // Processar com segurança...
};
```

**Proteções:**
- Apenas OpenPix pode enviar webhooks válidos
- Impossível forjar sem o HMAC secret
- Garantia criptográfica de autenticidade

---

## 📚 Documentos Relacionados

1. **`OPENPIX_HMAC_MIGRATION.md`** - Guia completo de migração HMAC
2. **`SECURITY_REPORT.md`** - Relatório de segurança geral
3. **`MODULO_FORNECEDOR_PLAYK.md`** - Documentação do módulo de fornecedor
4. **`.env.example`** - Template atualizado de variáveis

---

## 🆘 Suporte

**Logs em tempo real:**
```bash
netlify functions:log webhook --live
```

**Verificar variáveis:**
```bash
netlify env:list
```

**Contato OpenPix:**
- Email: suporte@woovi.com
- Dashboard: https://app.woovi.com

---

## ✅ Resumo Executivo

| Item | Status | Observação |
|------|--------|------------|
| URL do webhook atualizada | ✅ | `/webhook` ao invés de `/.netlify/functions/webhook` |
| HMAC SHA256 + base64 | ✅ | Validação implementada em `webhook.js` |
| Redirect configurado | ✅ | `netlify.toml:6-9` |
| OPENPIX_HMAC_SECRET | ⏳ | **Pendente:** Adicionar no Netlify |
| Testes automatizados | ⏳ | **Pendente:** Criar suite de testes |
| Documentação | ✅ | Completa e atualizada |

---

**Última Atualização:** Outubro 2025
**Status:** ✅ Pronto para uso (após configurar OPENPIX_HMAC_SECRET)
**Prioridade:** 🔴 CRÍTICA - Configurar HMAC_SECRET imediatamente
