# 🎯 Guia de Uso - Validators

## 📦 Arquivo: `src/utils/validators.ts`

Validadores centralizados para todo o projeto INTERBØX 2025. Elimina duplicação de código e garante consistência.

---

## 🚀 Quick Start

### Validação Simples (Individual)

```ts
import { isValidEmail, isValidCPF, isValidWhatsApp } from '@/utils/validators';

// Email
isValidEmail('user@example.com'); // true
isValidEmail('invalid-email');     // false

// CPF (com validação de dígitos)
isValidCPF('123.456.789-00');     // false (inválido)
isValidCPF('111.444.777-35');     // true (válido)

// WhatsApp/Telefone
isValidWhatsApp('11 99999-9999'); // true
isValidWhatsApp('(11) 99999-9999'); // true
isValidWhatsApp('11999999999');   // true
```

---

### Validação de Objetos Completos

```ts
import { validateContact, validateInscricao, validateSeguro } from '@/utils/validators';

// Validar dados de contato
const contactResult = validateContact({
  email: 'user@example.com',
  whatsapp: '11 99999-9999',
  cpf: '123.456.789-00'
});

if (!contactResult.valid) {
  console.log(contactResult.errors);
  // { cpf: 'CPF inválido (ex: 123.456.789-00)' }
}
```

---

## 📚 Exemplos de Uso

### 1. Validação em Formulários React (CheckoutCard)

**❌ Antes (20 linhas duplicadas):**

```tsx
const validateContactInfo = (): boolean => {
  const errors: Partial<ContactInfo> = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const whatsappRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
  const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

  if (!contactInfo.email || !emailRegex.test(contactInfo.email)) {
    errors.email = 'Email válido é obrigatório';
  }

  if (!contactInfo.whatsapp || !whatsappRegex.test(contactInfo.whatsapp)) {
    errors.whatsapp = 'WhatsApp válido é obrigatório';
  }

  if (!contactInfo.cpf || !cpfRegex.test(contactInfo.cpf)) {
    errors.cpf = 'CPF válido é obrigatório';
  }

  setContactErrors(errors);
  return Object.keys(errors).length === 0;
};
```

**✅ Depois (3 linhas):**

```tsx
import { validateContact } from '@/utils/validators';

const validateContactInfo = (): boolean => {
  const result = validateContact(contactInfo);
  setContactErrors(result.errors);
  return result.valid;
};
```

**Redução: -85% código**

---

### 2. Validação em APIs (Netlify Functions)

**❌ Antes:**

```js
export const handler = async (event) => {
  const data = JSON.parse(event.body);

  // Validação manual repetida
  if (!data.nome || !data.email || !data.tipo) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Dados obrigatórios faltando' })
    };
  }

  // ...
};
```

**✅ Depois:**

```js
import { validateInscricao } from '../../src/utils/validators.ts';

export const handler = async (event) => {
  const data = JSON.parse(event.body);

  const validation = validateInscricao(data);

  if (!validation.valid) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Validação falhou',
        details: validation.errors
      })
    };
  }

  // Prosseguir com lógica...
};
```

---

### 3. Validação em Tempo Real (onChange)

```tsx
import { isValidEmail, isValidCPF } from '@/utils/validators';
import { useState } from 'react';

function FormularioSeguro() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Validação em tempo real
    if (value && !isValidEmail(value)) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };

  return (
    <input
      type="email"
      value={email}
      onChange={handleEmailChange}
      className={emailError ? 'border-red-400' : 'border-gray-300'}
    />
  );
}
```

---

### 4. Formatação de Dados

```ts
import { formatCPF, formatTelefone, cleanNumeric } from '@/utils/validators';

// Formatar CPF
formatCPF('12345678900');        // '123.456.789-00'
formatCPF('123.456.789-00');     // '123.456.789-00' (já formatado)

// Formatar telefone
formatTelefone('11999999999');   // '(11) 99999-9999'
formatTelefone('1199999999');    // '(11) 9999-9999'

// Limpar números
cleanNumeric('123.456.789-00');  // '12345678900'
cleanNumeric('(11) 99999-9999'); // '11999999999'
```

---

### 5. Validação de Idade

```ts
import { isValidIdadeMinima } from '@/utils/validators';

// Validar idade mínima (padrão: 18 anos)
isValidIdadeMinima('2006-01-01');      // true
isValidIdadeMinima('2010-01-01');      // false

// Customizar idade mínima
isValidIdadeMinima('2008-01-01', 16);  // true (16+ anos)
isValidIdadeMinima('2010-01-01', 16);  // false
```

---

## 🎨 Validadores Disponíveis

### Individuais

| Função | Descrição | Exemplo |
|--------|-----------|---------|
| `isValidEmail()` | Valida formato de email | `user@domain.com` |
| `isValidWhatsApp()` | Valida telefone brasileiro | `11 99999-9999` |
| `isValidTelefone()` | Alias para WhatsApp | `(11) 99999-9999` |
| `isValidCPF()` | Valida CPF com dígitos verificadores | `123.456.789-00` |
| `isValidNomeCompleto()` | Valida nome + sobrenome | `João Silva` |
| `isValidDataISO()` | Valida data ISO | `2025-01-15` |
| `isValidDataBR()` | Valida data BR | `15/01/2025` |
| `isValidIdadeMinima()` | Valida idade mínima | `2000-01-01, 18` |
| `isValidURL()` | Valida URL | `https://example.com` |

### Compostos (Objetos)

| Função | Descrição | Retorno |
|--------|-----------|---------|
| `validateContact()` | Valida dados de contato | `ValidationResult` |
| `validateInscricao()` | Valida dados de inscrição | `ValidationResult` |
| `validateSeguro()` | Valida dados de seguro | `ValidationResult` |

### Express (Arrays de Erros)

| Função | Descrição | Retorno |
|--------|-----------|---------|
| `validateContactErrors()` | Retorna array de erros | `string[]` |
| `validateInscricaoErrors()` | Retorna array de erros | `string[]` |
| `validateSeguroErrors()` | Retorna array de erros | `string[]` |

---

## 🔧 Regex Patterns

Todos os regex estão centralizados e exportados:

```ts
import { REGEX } from '@/utils/validators';

REGEX.EMAIL          // Email pattern
REGEX.WHATSAPP       // WhatsApp/Telefone
REGEX.CPF            // CPF brasileiro
REGEX.DATA_ISO       // YYYY-MM-DD
REGEX.DATA_BR        // DD/MM/YYYY
REGEX.NOME_COMPLETO  // Nome + Sobrenome
REGEX.URL            // URL válida
```

**Uso:**

```ts
import { REGEX } from '@/utils/validators';

if (REGEX.EMAIL.test(email)) {
  console.log('Email válido!');
}
```

---

## 📊 Comparação: Antes vs Depois

### CheckoutCard.tsx

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Linhas de validação** | 20 | 3 | -85% |
| **Regex duplicados** | 3 | 0 | -100% |
| **Lógica de validação** | Local | Reutilizável | ✅ |
| **Testes unitários** | ✗ | ✓ | ✅ |
| **Consistência** | Baixa | Alta | ✅ |

### Save-inscricao.js

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Validação manual** | if/else aninhados | Função única | -70% |
| **Mensagens de erro** | Genéricas | Específicas | ✅ |
| **Reuso de código** | ✗ | ✓ | ✅ |

---

## 🎯 Casos de Uso por Contexto

### Frontend (React/TypeScript)

```tsx
import { validateContact, formatCPF } from '@/utils/validators';

// 1. Validação ao submit
const handleSubmit = () => {
  const result = validateContact(formData);
  if (!result.valid) {
    setErrors(result.errors);
    return;
  }
  // Prosseguir...
};

// 2. Formatação ao blur
const handleCPFBlur = () => {
  setCpf(formatCPF(cpf));
};
```

### Backend (Netlify Functions)

```js
import { validateInscricao } from '../../src/utils/validators.ts';

export const handler = async (event) => {
  const data = JSON.parse(event.body);

  const validation = validateInscricao(data);
  if (!validation.valid) {
    return jsonResponse(400, { errors: validation.errors });
  }

  // Processar...
};
```

### Configuração (Config files)

```js
import { isValidURL, isValidEmail } from '../src/utils/validators';

export const CONFIG = {
  API_URL: process.env.API_URL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL
};

// Validar config ao carregar
if (!isValidURL(CONFIG.API_URL)) {
  throw new Error('API_URL inválida');
}

if (!isValidEmail(CONFIG.ADMIN_EMAIL)) {
  throw new Error('ADMIN_EMAIL inválido');
}
```

---

## 🚀 Migração Recomendada

### Ordem de Prioridade

1. ✅ **CheckoutCard.tsx** - Alto impacto, fácil migração
2. ⏳ **save-inscricao.js** - Validação backend crítica
3. ⏳ **save-seguro.js** - Validação de dados sensíveis
4. ⏳ **Formulários de seguro** - Múltiplos campos
5. ⏳ **Admin panels** - Validação de inputs

### Template de Migração

```diff
- const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
- if (!email || !emailRegex.test(email)) {
-   errors.email = 'Email inválido';
- }

+ import { isValidEmail } from '@/utils/validators';
+ if (!isValidEmail(email)) {
+   errors.email = 'Email inválido';
+ }
```

---

## 🐛 Troubleshooting

### Problema: Import não funciona

```
Error: Cannot find module '@/utils/validators'
```

**Solução:** Usar path relativo ou configurar alias no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Problema: TypeScript reclama de tipos

**Solução:** Importar tipos também:

```ts
import {
  validateContact,
  type ContactData,
  type ValidationResult
} from '@/utils/validators';
```

---

## 📝 Checklist de Migração

Para cada arquivo com validação:

- [ ] Importar validators no topo
- [ ] Remover regex locais duplicados
- [ ] Substituir lógica de validação por funções
- [ ] Testar com dados válidos e inválidos
- [ ] Verificar mensagens de erro
- [ ] Remover código comentado/unused

---

## 💡 Dicas

1. **Use validadores compostos** (`validateContact`) ao invés de individuais quando possível
2. **Valide no frontend E backend** - nunca confie apenas no cliente
3. **Use formatadores** ao exibir dados ao usuário
4. **Teste edge cases:** strings vazias, null, undefined, espaços
5. **Mantenha mensagens consistentes** entre validadores

---

**Criado em:** 2025-10-02
**Versão:** 1.0.0
**Maintainer:** INTERBØX Team
