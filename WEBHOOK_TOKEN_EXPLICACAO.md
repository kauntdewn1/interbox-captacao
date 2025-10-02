# 🔐 Explicação: VITE_OPENPIX_WEBHOOK_TOKEN

## ❓ Sua Pergunta

> "usávamos essa variável VITE_OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_secure com VITE_ mudou?"

## ✅ Resposta: DEPENDE DO USO

### 📊 Análise Atual

**Arquivo:** `src/config/openpix-config.js:13`
```javascript
const OPENPIX_WEBHOOK_TOKEN = process.env.OPENPIX_WEBHOOK_TOKEN;
```

**Status:** ⚠️ Este arquivo está tentando ler `process.env.OPENPIX_WEBHOOK_TOKEN` **SEM** o prefixo `VITE_`.

**Problema:** No Vite (frontend), `process.env` só funciona para variáveis com prefixo `VITE_`.

---

## 🎯 Duas Situações Diferentes

### Situação 1: Token de Identificação Simples (Frontend)

**Uso:** Comparar com query param ou validação básica no frontend

**Exemplo:**
```typescript
// src/components/WebhookHandler.tsx
const urlToken = new URLSearchParams(location.search).get('token');
const expectedToken = import.meta.env.VITE_OPENPIX_WEBHOOK_TOKEN;

if (urlToken === expectedToken) {
  // OK, continuar
}
```

**Neste caso:**
- ✅ **Pode** usar `VITE_` porque não é sensível
- ✅ **Pode** estar exposto no bundle frontend
- ✅ É apenas um identificador público
- ⚠️ **NÃO** serve para segurança real

**Configuração:**
```bash
# .env
VITE_OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_public
```

---

### Situação 2: Secret para Validação HMAC (Backend)

**Uso:** Validar assinatura HMAC do webhook no backend

**Exemplo:**
```javascript
// netlify/functions/webhook.js
const crypto = require('crypto');

const verifySignature = (payload, signature) => {
  const secret = process.env.OPENPIX_WEBHOOK_SECRET; // ← SEM VITE_
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex') === signature;
};
```

**Neste caso:**
- ❌ **NUNCA** usar `VITE_` (seria exposto)
- ❌ **NUNCA** pode estar no bundle frontend
- ✅ Deve ser aleatório e seguro
- ✅ Serve para segurança real

**Configuração:**
```bash
# .env (Backend/Netlify Functions)
OPENPIX_WEBHOOK_SECRET=$(openssl rand -hex 32)
```

---

## 🛠️ Correção Recomendada

### Se `openpix-config.js` é usado no Frontend:

**Arquivo:** `src/config/openpix-config.js`

**Mudar de:**
```javascript
const OPENPIX_WEBHOOK_TOKEN = process.env.OPENPIX_WEBHOOK_TOKEN;
```

**Para:**
```javascript
// Vite usa import.meta.env, não process.env
const OPENPIX_WEBHOOK_TOKEN = import.meta.env.VITE_OPENPIX_WEBHOOK_TOKEN;
```

**E manter no `.env`:**
```bash
VITE_OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_public
```

**✅ Isso está OK se for apenas identificador público.**

---

### Se Precisa de Validação Segura (Backend):

**Criar nova variável separada:**

```bash
# .env

# Frontend (público, não sensível)
VITE_OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_public

# Backend (privado, sensível, para HMAC)
OPENPIX_WEBHOOK_SECRET=a1b2c3d4e5f6...  # Aleatório de 64 caracteres
```

**Usar no webhook:**
```javascript
// netlify/functions/webhook.js
const secret = process.env.OPENPIX_WEBHOOK_SECRET; // ← Privado, seguro
```

**Usar no frontend (se necessário):**
```javascript
// src/config/openpix-config.js
const OPENPIX_WEBHOOK_TOKEN = import.meta.env.VITE_OPENPIX_WEBHOOK_TOKEN; // ← Público
```

---

## 📋 Checklist de Decisão

**Pergunta 1:** O token é usado no frontend (src/)?
- ✅ Sim → Precisa ter `VITE_`
- ❌ Não → NÃO pode ter `VITE_`

**Pergunta 2:** O token serve para validação de segurança (HMAC)?
- ✅ Sim → **NUNCA** usar `VITE_`, criar `OPENPIX_WEBHOOK_SECRET`
- ❌ Não → Pode usar `VITE_` se for só identificador

**Pergunta 3:** Qual arquivo está usando?
- `src/config/openpix-config.js` → Frontend → Precisa `VITE_`
- `netlify/functions/webhook.js` → Backend → **NÃO** pode ter `VITE_`

---

## 🎯 Resumo Final

### O Que Você Tinha Antes:

```bash
# .env
VITE_OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_secure
```

### O Que Precisa Agora:

**Opção A - Se for só identificador público (recomendado):**
```bash
# .env
VITE_OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_public
```

**E corrigir `src/config/openpix-config.js`:**
```javascript
// Linha 13 - MUDAR
const OPENPIX_WEBHOOK_TOKEN = import.meta.env.VITE_OPENPIX_WEBHOOK_TOKEN;
```

**Opção B - Se precisar de validação HMAC (mais seguro):**
```bash
# .env

# Frontend (público)
VITE_OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_public

# Backend (privado, para HMAC)
OPENPIX_WEBHOOK_SECRET=$(openssl rand -hex 32)
```

---

## 🔍 Como Verificar Qual Você Precisa

**Execute:**
```bash
# Ver onde WEBHOOK_TOKEN é usado
grep -r "WEBHOOK_TOKEN" src/
grep -r "WEBHOOK_TOKEN" netlify/functions/
```

**Resultado:**
- Se aparecer em `src/` → Precisa `VITE_`
- Se aparecer em `netlify/functions/` → **NÃO** pode ter `VITE_`
- Se aparecer nos dois → Criar duas variáveis diferentes

---

## ✅ Minha Recomendação Final

**Fazer:**

1. **Corrigir `src/config/openpix-config.js`** (linha 13):
```javascript
const OPENPIX_WEBHOOK_TOKEN = import.meta.env.VITE_OPENPIX_WEBHOOK_TOKEN;
```

2. **Manter no `.env`:**
```bash
VITE_OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_public
```

3. **Adicionar validação HMAC no webhook** (novo):
```bash
OPENPIX_WEBHOOK_SECRET=$(openssl rand -hex 32)
```

**Por quê?**
- ✅ `VITE_OPENPIX_WEBHOOK_TOKEN` é público, OK estar exposto
- ✅ `OPENPIX_WEBHOOK_SECRET` é privado, nunca exposto
- ✅ Separação clara entre frontend e backend
- ✅ Segurança em camadas

---

**Conclusão:** O `VITE_` no `WEBHOOK_TOKEN` está **OK** se for usado apenas como identificador público no frontend. Mas crie um `OPENPIX_WEBHOOK_SECRET` separado (sem `VITE_`) para validação HMAC no backend.
