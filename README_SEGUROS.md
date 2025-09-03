# 🛡️ Sistema de Seguros INTERBØX 2025

> **Sistema completo para contratação e gestão de seguros do maior evento fitness de times da América Latina**

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/interbox-captacao/deploys)
[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0.0-blue.svg)](https://tailwindcss.com/)

## 🎯 Visão Geral

O Sistema de Seguros INTERBØX 2025 é uma solução completa desenvolvida para facilitar a contratação de seguros pelos participantes do evento. Desenvolvido em parceria com a **Saga Corretora de Seguros**, o sistema oferece:

- ✅ **Formulário público** para contratação
- ✅ **Dashboard administrativo** para gestão
- ✅ **Integração completa** com banco de dados
- ✅ **Design responsivo** com glassmorphism
- ✅ **UX otimizada** seguindo padrões INTERBØX

## 🚀 Funcionalidades Principais

### 📱 Página Pública (`/seguro`)
- Formulário completo com validações
- Campos obrigatórios e opcionais
- Verificação de CPF único (1 CPF = 1 seguro)
- Instruções claras de pagamento
- Confirmação visual de sucesso

### 🖥️ Dashboard Admin (`/adm_seguro`)
- Acesso restrito via API Key
- Estatísticas em tempo real
- Filtros avançados por status e data
- Controle de status dos seguros
- Exportação de dados em CSV

### 🔄 Gestão de Status
- **Pendente Comprovante:** Formulário preenchido
- **Comprovante Enviado:** PIX realizado
- **Pago e Confirmado:** Pagamento validado

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Netlify        │    │   Notion        │
│   React + TS    │◄──►│   Functions      │◄──►│   Database      │
│   Tailwind CSS  │    │   (Node.js)      │    │   (API)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Tecnologias Utilizadas
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Netlify Functions (Node.js)
- **Banco:** Supabase (PostgreSQL)
- **Deploy:** Netlify
- **Estilo:** Glassmorphism + Design System INTERBØX

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Netlify
- Conta Notion com API Token
- Database Notion configurado

## 🚀 Instalação e Configuração

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/interbox-captacao.git
cd interbox-captacao
```

### 2. Instale as Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as Variáveis de Ambiente
Crie um arquivo `.env.local`:
```bash
# Notion
NOTION_TOKEN=your_notion_token_here
NOTION_DATABASE_ID=your_database_id_here

# Admin
ADMIN_API_KEY=interbox2025
```

### 4. Configure o Database Notion
Crie um database com as seguintes propriedades:
- **Nome** (Title)
- **CPF** (Rich Text)
- **Data de Nascimento** (Date)
- **Sexo** (Select)
- **Email** (Email)
- **Telefone** (Phone)
- **Nome do Time** (Rich Text)
- **Observações** (Rich Text)
- **Tipo** (Select)
- **Valor** (Number)
- **Status** (Select)
- **Data de Criação** (Date)

### 5. Execute o Projeto
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🌐 Deploy

### Netlify (Recomendado)
1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Configuração das Functions
As Netlify Functions são configuradas automaticamente:
- `save-seguro.js` - Salvar novo seguro
- `admin-seguros.js` - Listar seguros (admin)
- `update-seguro-status.js` - Atualizar status

## 📱 Como Usar

### Para Usuários Finais
1. Acesse `/seguro`
2. Preencha o formulário
3. Faça o PIX de R$ 39,90
4. Envie o comprovante por email
5. Aguarde confirmação

### Para Administradores
1. Acesse `/adm_seguro`
2. Insira sua API Key
3. Sincronize os dados
4. Gerencie os seguros
5. Exporte relatórios

## 🔧 Configuração Avançada

### Personalização de Cores
Edite `config/seguro.config.js`:
```javascript
UI: {
  cores: {
    primaria: '#3B82F6',    // Azul
    secundaria: '#8B5CF6',  // Roxo
    sucesso: '#10B981',     // Verde
    // ...
  }
}
```

### Validações Customizadas
```javascript
CAMPOS: {
  validacoes: {
    cpf: {
      unico: true,
      formato: '000.000.000-00'
    }
  }
}
```

## 📊 Estrutura de Arquivos

```
src/
├── pages/
│   ├── seguro/
│   │   └── index.tsx          # Página pública
│   └── admin/
│       └── seguro.tsx         # Dashboard admin
├── components/                 # Componentes reutilizáveis
├── config/
│   └── seguro.config.js       # Configurações
└── hooks/                     # Hooks customizados

netlify/
└── functions/
    ├── save-seguro.js         # API salvar seguro
    ├── admin-seguros.js       # API listar seguros
    └── update-seguro-status.js # API atualizar status

docs/
├── SISTEMA_SEGUROS.md         # Documentação técnica
└── EXEMPLO_USO_SEGUROS.md    # Guia prático
```

## 🔐 Segurança

### Autenticação
- **Página Pública:** Token `Bearer interbox2025`
- **Dashboard Admin:** API Key personalizada do parceiro

### Validações
- CPF único por seguro
- Campos obrigatórios
- Formato de dados
- Rate limiting

## 📈 Monitoramento

### Analytics
- Page views
- Form submissions
- Error tracking
- Performance metrics

### Logs
- Console logs (desenvolvimento)
- Netlify function logs
- Notion API logs

## 🚨 Troubleshooting

### Problemas Comuns

#### Formulário não envia
- Verificar conexão com internet
- Validar campos obrigatórios
- Verificar console para erros

#### API Key não funciona
- Verificar se a chave está correta
- Confirmar permissões da API Key
- Verificar variáveis de ambiente

#### Dados não sincronizam
- Verificar token do Notion
- Confirmar ID do database
- Verificar logs das functions

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

### Para Usuários
- **Email:** financeirocorretora@gruposaga.com.br
- **Assunto:** Suporte Seguro INTERBØX

### Para Desenvolvedores
- **Issues:** GitHub Issues
- **Documentação:** `docs/` folder
- **Configuração:** `config/` folder

## 📄 Licença

Este projeto é propriedade da INTERBØX e está sob licença proprietária.

## 🙏 Agradecimentos

- **Saga Corretora de Seguros** - Parceira no projeto
- **Equipe INTERBØX** - Desenvolvimento e suporte
- **Comunidade React** - Ferramentas e bibliotecas

---

**Desenvolvido com ❤️ pela equipe INTERBØX**  
**Parceiro:** Saga Corretora de Seguros  
**Versão:** 1.0.0  
**Última atualização:** Dezembro 2024
