# 🔐 Migração: Validação HMAC OpenPix/Woovi

## 📋 O Que Mudou

### ❌ Antes (Removido)
```bash
OPENPIX_API_URL=https://api.woovi.com  # Removida (URL fixa)
OPENPIX_WEBHOOK_TOKEN=...              # Token simples (inseguro)
```

### ✅ Agora (Novo Padrão)
```bash
OPENPIX_HMAC_SECRET=openpix_xxxxxxxxxx/Qfc=  # Gerado pelo Woovi
```

---

## 🔑 O Que é o OPENPIX_HMAC_SECRET?

**É uma chave fornecida automaticamente pela Woovi/OpenPix** ao criar o webhook no dashboard.

**Formato:** `openpix_` + string aleatória + possivelmente `/` ou `=` no final

**Exemplo:** `openpix_abc123def456ghi789/Qfc=`

**Propósito:** Validar que requisições recebidas no webhook **realmente** vêm da OpenPix, não de atacantes.

---

## 🛠️ Como Obter o HMAC Secret

### Passo 1: Acessar Dashboard Woovi

```
https://app.woovi.com/home/webhooks
```

### Passo 2: Criar ou Editar Webhook

1. Clicar em **"Novo Webhook"** ou editar existente
2. Configurar URL: `https://interbox-captacao.netlify.app/.netlify/functions/webhook`
3. Selecionar eventos:
   - ✅ `OPENPIX:TRANSACTION_RECEIVED`
4. Ao salvar, o **HMAC Secret é exibido automaticamente**

### Passo 3: Copiar HMAC Secret

**⚠️ IMPORTANTE:** A chave é exibida apenas **uma vez**. Copie e salve imediatamente!

```bash
# Exemplo do que você verá:
HMAC Secret: openpix_a1b2c3d4e5f6g7h8i9j0/Qfc=
```

### Passo 4: Adicionar no .env

```bash
# Adicionar no .env local
OPENPIX_HMAC_SECRET=openpix_a1b2c3d4e5f6g7h8i9j0/Qfc=

# Adicionar no Netlify (Environment Variables)
netlify env:set OPENPIX_HMAC_SECRET "openpix_a1b2c3d4e5f6g7h8i9j0/Qfc="
```

---

## 🔐 Como Funciona a Validação HMAC

### Header Enviado pela OpenPix

```http
POST /.netlify/functions/webhook
x-openpix-signature: iAq3nD9xKl2P+8Zt/Qfc=
Content-Type: application/json

{
  "event": "OPENPIX:TRANSACTION_RECEIVED",
  "transaction": { ... }
}
```

### Validação no Backend (webhook.js)

```javascript
import crypto from 'crypto';

const verifyWebhookSignature = (payload, signature) => {
  const secret = process.env.OPENPIX_HMAC_SECRET;

  // 1. Criar HMAC-SHA256 com o secret
  const hmac = crypto.createHmac('sha256', secret);

  // 2. Processar payload (JSON stringificado)
  hmac.update(JSON.stringify(payload));

  // 3. Gerar digest em BASE64 (não hex!)
  const expectedSignature = hmac.digest('base64');

  // 4. Comparar com signature recebida
  return expectedSignature === signature;
};
```

**Pontos Críticos:**

1. ✅ Usar `sha256` (não `sha1`)
2. ✅ Usar `.digest('base64')` (não `.digest('hex')`)
3. ✅ Comparar strings diretamente (não usar timing attack vulnerable comparison)

---

## ⚠️ Diferenças Importantes

### OpenPix vs Outros Gateways

| Gateway | Algoritmo | Digest | Header |
|---------|-----------|--------|--------|
| **OpenPix/Woovi** | HMAC-SHA256 | **base64** | `x-openpix-signature` |
| Stripe | HMAC-SHA256 | **hex** | `stripe-signature` |
| Mercado Pago | HMAC-SHA256 | **hex** | `x-signature` |
| PagSeguro | MD5 | **hex** | `x-pagseguro-signature` |

**⚠️ OpenPix usa base64, não hex!**

---

## 🧪 Como Testar a Validação

### Teste 1: Webhook Local com HMAC Válido

```bash
# Gerar assinatura HMAC correta
SECRET="openpix_seu_secret_aqui"
PAYLOAD='{"event":"OPENPIX:TRANSACTION_RECEIVED","transaction":{"correlationID":"test"}}'

# Calcular HMAC SHA256 base64
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64)

# Enviar requisição
curl -X POST http://localhost:8888/.netlify/functions/webhook \
  -H "Content-Type: application/json" \
  -H "x-openpix-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**✅ Esperado:** `200 OK` com log `✅ Webhook OpenPix autenticado via HMAC`

### Teste 2: Webhook com HMAC Inválido

```bash
curl -X POST http://localhost:8888/.netlify/functions/webhook \
  -H "Content-Type: application/json" \
  -H "x-openpix-signature: assinatura_falsa_123" \
  -d '{"event":"OPENPIX:TRANSACTION_RECEIVED"}'
```

**✅ Esperado:** `401 Unauthorized` com mensagem `Invalid HMAC signature`

### Teste 3: Webhook sem Header HMAC

```bash
curl -X POST http://localhost:8888/.netlify/functions/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"OPENPIX:TRANSACTION_RECEIVED"}'
```

**✅ Esperado:** `401 Unauthorized` com log `❌ Header x-openpix-signature ausente`

---

## 🔍 Troubleshooting

### Problema 1: Webhook sempre retorna 401

**Sintomas:**
```
❌ Assinatura HMAC inválida
received: iAq3nD9xKl2P+8Zt...
expected: zY8wV2bM5nA1cR4k...
```

**Possíveis Causas:**

1. **HMAC Secret errado**
   ```bash
   # Verificar secret configurado
   netlify env:get OPENPIX_HMAC_SECRET
   ```

2. **Payload modificado**
   - Middleware de parsing pode alterar JSON
   - Usar `event.body` raw, não `JSON.parse()` antes de validar

3. **Encoding errado**
   ```javascript
   // ❌ ERRADO
   const hmac = crypto.createHmac('sha256', secret);
   hmac.update(payload); // payload como objeto
   const sig = hmac.digest('hex'); // hex ao invés de base64

   // ✅ CORRETO
   const hmac = crypto.createHmac('sha256', secret);
   hmac.update(JSON.stringify(payload)); // JSON string
   const sig = hmac.digest('base64'); // base64
   ```

### Problema 2: HMAC Secret não encontrado

**Sintomas:**
```
⚠️ OPENPIX_HMAC_SECRET não configurado - webhook NÃO validado (INSEGURO!)
```

**Solução:**

1. Verificar `.env`:
   ```bash
   cat .env | grep OPENPIX_HMAC_SECRET
   ```

2. Se não existir, obter do dashboard Woovi:
   ```
   https://app.woovi.com/home/webhooks
   ```

3. Adicionar no `.env` e Netlify:
   ```bash
   # Local
   echo "OPENPIX_HMAC_SECRET=openpix_seu_secret" >> .env

   # Netlify
   netlify env:set OPENPIX_HMAC_SECRET "openpix_seu_secret"
   ```

### Problema 3: Signature vem null/undefined

**Sintomas:**
```
❌ Header x-openpix-signature ausente
```

**Causas:**

1. **Webhook não configurado corretamente** no dashboard Woovi
   - Verificar se webhook está ativo
   - Verificar URL correta

2. **Teste local sem header**
   ```bash
   # Adicionar header ao testar
   curl -H "x-openpix-signature: test" ...
   ```

3. **Netlify não repassa header**
   - Headers com hífen podem ter problemas
   - Verificar `event.headers` em lowercase:
     ```javascript
     const signature = event.headers['x-openpix-signature'];
     ```

---

## 📊 Comparação: Antes vs Depois

### Antes (Inseguro)

```javascript
// ❌ SEM validação HMAC
export const handler = async (event) => {
  const webhookData = JSON.parse(event.body);

  // Qualquer requisição é aceita!
  if (webhookData.event === 'OPENPIX:TRANSACTION_RECEIVED') {
    // Processar...
  }
};
```

**Vulnerabilidades:**
- Atacante pode enviar webhooks falsos
- Possível criar transações fictícias
- Sem garantia de origem

### Depois (Seguro)

```javascript
// ✅ COM validação HMAC SHA256 + base64
export const handler = async (event) => {
  const webhookData = JSON.parse(event.body);
  const signature = event.headers['x-openpix-signature'];

  // 🔐 Validar assinatura antes de processar
  if (!verifyWebhookSignature(webhookData, signature)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  // ✅ Apenas webhooks autênticos chegam aqui
  if (webhookData.event === 'OPENPIX:TRANSACTION_RECEIVED') {
    // Processar com segurança...
  }
};
```

**Proteções:**
- Apenas requisições da OpenPix são aceitas
- Impossível forjar webhooks sem o secret
- Garantia criptográfica de origem

---

## 🎯 Checklist de Migração

### Pré-Migração

- [ ] Acessar dashboard Woovi: https://app.woovi.com/home/webhooks
- [ ] Copiar HMAC Secret do webhook existente
- [ ] Salvar secret em local seguro (1Password, etc)

### Migração

- [ ] Adicionar `OPENPIX_HMAC_SECRET` no `.env` local
- [ ] Adicionar `OPENPIX_HMAC_SECRET` no Netlify:
  ```bash
  netlify env:set OPENPIX_HMAC_SECRET "openpix_..."
  ```
- [ ] Remover `OPENPIX_API_URL` do `.env` (não mais necessária)
- [ ] Remover `OPENPIX_WEBHOOK_TOKEN` do `.env` (substituída por HMAC)
- [ ] Atualizar `.env.example` com nova variável

### Validação

- [ ] Deploy do webhook atualizado
- [ ] Testar com requisição falsa (deve retornar 401)
- [ ] Testar com webhook real da OpenPix (deve retornar 200)
- [ ] Verificar logs do Netlify:
  ```
  ✅ Webhook OpenPix autenticado via HMAC
  ```
- [ ] Confirmar transação real processada corretamente

### Pós-Migração

- [ ] Documentar HMAC Secret no gerenciador de senhas
- [ ] Atualizar documentação de onboarding de devs
- [ ] Configurar alertas para falhas de validação HMAC
- [ ] Revisar logs de segurança nas primeiras 48h

---

## 🔗 Links Úteis

- **Dashboard Woovi Webhooks:** https://app.woovi.com/home/webhooks
- **Documentação OpenPix Webhooks:** https://developers.woovi.com/docs/webhook/webhook-openpix
- **Algoritmo HMAC SHA256:** https://en.wikipedia.org/wiki/HMAC
- **Node.js Crypto:** https://nodejs.org/api/crypto.html#cryptocreathmacalgorithm-key-options

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. **Verificar logs do Netlify:**
   ```bash
   netlify functions:log webhook --live
   ```

2. **Testar localmente:**
   ```bash
   netlify dev
   # Em outro terminal:
   curl -X POST http://localhost:8888/.netlify/functions/webhook ...
   ```

3. **Contato OpenPix:** suporte@woovi.com

---

**Última Atualização:** Outubro 2025
**Autor:** Equipe INTERBØX
**Versão:** 2.0 (HMAC SHA256 base64)
