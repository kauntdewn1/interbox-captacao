# 🛡️ Sistema de Seguros INTERBØX 2025

## 📋 Visão Geral

Sistema completo para contratação e gestão de seguros do INTERBØX 2025, desenvolvido em parceria com a **Saga Corretora de Seguros**.

## 🎯 Funcionalidades

### 1. Página Pública de Contratação (`/seguro`)

#### Campos Obrigatórios

- ✅ Nome completo
- ✅ CPF
- ✅ Data de nascimento
- ✅ Sexo
- ✅ Email
- ✅ Telefone
- ✅ Nome do time
- ✅ Observações (opcional)

#### Informações do Seguro

- **Valor fixo:** R$ 39,90
- **Forma de pagamento:** PIX
- **Chave PIX:** 00.283.283/0001-26
- **Beneficiário:** Saga Corretora de Seguros
- **Email para comprovante:** financeirocorretora@gruposaga.com.br

#### Fluxo de Usuário

1. Preenchimento do formulário
2. Validação de campos obrigatórios
3. Verificação de CPF único (1 CPF = 1 seguro)
4. Registro no sistema
5. Exibição de instruções para pagamento
6. Orientação para envio do comprovante

### 2. Página Administrativa (`/adm_seguro`)

#### Acesso Restrito

- Login via API Key do parceiro Saga
- Interface administrativa completa

#### Funcionalidades

- 📊 **Dashboard com estatísticas:**
  - Total de seguros
  - Seguros pendentes
  - Comprovantes enviados
  - Pagos e confirmados
  - Valor total arrecadado

- 🔍 **Filtros avançados:**
  - Por status
  - Por data (início/fim)
  - Por CPF
  - Combinação de filtros

- 📋 **Listagem completa:**
  - Dados do segurado
  - Status atual
  - Data de criação
  - Ações rápidas

- ⚙️ **Controle de Status:**
  - Pendente envio comprovante
  - Comprovante enviado
  - Pago e confirmado (manual)

- 📊 **Exportação de dados:**
  - CSV completo
  - Dados filtrados
  - Nomenclatura automática com data

## 🏗️ Arquitetura Técnica

### Frontend (React + TypeScript)
```
src/pages/seguro/
├── index.tsx          # Página pública de contratação
└── success/           # Página de sucesso

src/pages/admin/
└── seguro.tsx        # Dashboard administrativo
```

### Backend (Netlify Functions)
```
netlify/functions/
├── save-seguro.js           # Salvar novo seguro
├── admin-seguros.js         # Listar seguros (admin)
└── update-seguro-status.js  # Atualizar status
```

### Banco de Dados (Supabase)

- **Provider:** Supabase (PostgreSQL)
- **URL:** https://ymriypyyirnwctyitcsu.supabase.co
- **Tabela:** seguros
- **Schema:** Estruturado com validações e índices

## 🔐 Segurança e Autenticação

### Página Pública

- **Token:** `Bearer interbox2025`
- **Validação:** Campos obrigatórios
- **Verificação:** CPF único por seguro

### Página Administrativa

- **API Key:** Fornecida pelo parceiro Saga
- **Validação:** Bearer token personalizado
- **Controle:** Acesso restrito às funções admin

## 📱 Design e UX

### Identidade Visual

- **Glassmorphism leve** seguindo padrão INTERBØX
- **Cores:** Azul e roxo (seguros) + verde (sucesso)
- **Logo Saga:** Integrada em pontos estratégicos

### Responsividade

- **Mobile-first** design
- **Grid adaptativo** para diferentes telas
- **Componentes otimizados** para mobile

### Gamificação

- **Progresso visual** no formulário
- **Feedback imediato** de validação
- **Animações suaves** de transição

## 🔄 Fluxo de Dados

### 1. Contratação

Usuário → Formulário → Validação → API → Notion → Confirmação


### 2. Administração

Admin → API Key → Sincronização → Dados → Filtros → Ações
```

### 3. Atualização de Status

Admin → Seleção → API → Notion → Confirmação → UI
```

## 🚀 Deploy e Configuração

### Variáveis de Ambiente

SUPABASE_URL=https://ymriypyyirnwctyitcsu.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key


### Netlify
- **Functions:** Automático via `netlify/functions/`
- **Build:** React + TypeScript
- **Domain:** `interbox-captacao.netlify.app`

## 📊 Monitoramento e Analytics

### Tracking
- **Page views** via `useAnalytics`
- **Form submissions** com fallback localStorage
- **Error logging** para debugging

### Métricas
- **Conversão:** Formulários iniciados vs. completados
- **Performance:** Tempo de carregamento
- **Usabilidade:** Campos com mais erros

## 🔧 Manutenção e Suporte

### Logs
- **Console:** Frontend errors
- **Netlify:** Function logs
- **Notion:** Database activity

### Backup
- **LocalStorage:** Dados temporários
- **Notion:** Fonte da verdade
- **API:** Sincronização automática

## 📈 Roadmap Futuro

### Fase 2
- [ ] Integração com sistema de pagamento
- [ ] Notificações automáticas por email
- [ ] Dashboard de métricas avançadas

### Fase 3
- [ ] App mobile para segurados
- [ ] Sistema de claims/indenizações
- [ ] Integração com seguradoras

## 🤝 Parceiros

### Saga Corretora de Seguros
- **Responsável:** Gestão administrativa
- **Acesso:** Dashboard completo
- **Contato:** financeirocorretora@gruposaga.com.br

### INTERBØX
- **Responsável:** Desenvolvimento e infraestrutura
- **Acesso:** Sistema completo
- **Contato:** Equipe técnica

---

**Última atualização:** Dezembro 2024  
**Versão:** 1.0.0  
**Status:** Produção
