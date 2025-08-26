# 🎯 INTERBØX Captação 2025

> Sistema de captação para Judge, Staff e Audiovisual do maior evento de parkour do Brasil

## 🚀 **Sobre o Projeto**

O **INTERBØX Captação** é uma aplicação web moderna desenvolvida para gerenciar inscrições de:
- **Judge** - Júri técnico do evento
- **Staff** - Equipe operacional
- **Audiovisual** - Candidatos para cobertura audiovisual

## 🛠️ **Tecnologias**

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Netlify Functions
- **Pagamentos:** OpenPix/Woovi API
- **Deploy:** Netlify
- **Build:** Vite + TypeScript

## 📁 **Estrutura do Projeto**

```
src/
├── components/          # Componentes React
│   ├── Header.tsx      # Cabeçalho da aplicação
│   ├── Footer.tsx      # Rodapé da aplicação
│   ├── SEOHead.tsx     # Meta tags SEO
│   └── CheckoutCard.tsx # Componente de checkout
├── pages/              # Páginas da aplicação
│   ├── captacao/       # Páginas de captação
│   ├── judge/          # Páginas específicas para Judge
│   ├── staff/          # Páginas específicas para Staff
│   └── audiovisual/    # Páginas de audiovisual
├── hooks/              # Custom hooks
│   └── useAnalytics.ts # Hook para analytics
└── config/             # Configurações
    └── openpix-config.js # Configuração OpenPix/Woovi

netlify/
└── functions/          # Netlify Functions
    ├── create-charge.js # Cria charges de pagamento
    ├── check-charge.js  # Verifica status de charges
    └── webhook.js       # Recebe webhooks OpenPix
```

## 🚀 **Como Executar**

### **Desenvolvimento Local**
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Acessar: http://localhost:5173
```

### **Build de Produção**
```bash
# Gerar build
npm run build

# Preview do build
npm run preview
```

## 🌐 **URLs de Produção**

- **Aplicação:** https://interbox-captacao.netlify.app
- **Judge & Staff:** https://interbox-captacao.netlify.app/captacao/judge-staff
- **Audiovisual:** https://interbox-captacao.netlify.app/audiovisual

## 💳 **Integração OpenPix/Woovi**

### **Netlify Functions**
- **`/create-charge`** - Cria charges de pagamento
- **`/check-charge`** - Verifica status de charges
- **`/webhook`** - Recebe notificações de pagamento

### **Configuração**
As credenciais e configurações estão em `src/config/openpix-config.js`

## 🔧 **Configuração Netlify**

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Functions Directory:** `netlify/functions`
- **Environment Variables:** Configuradas no painel Netlify

## 📱 **Funcionalidades**

### **Judge & Staff**
- ✅ Informações sobre as funções
- ✅ Processo de inscrição
- ✅ Checkout integrado
- ✅ Confirmação de pagamento

### **Audiovisual**
- ✅ Apresentação da oportunidade
- ✅ Formulário de inscrição
- ✅ Sistema de pagamento
- ✅ Acompanhamento de status

## 🎨 **Design System**

- **Cores:** Gradientes pink/purple (INTERBØX)
- **Tipografia:** Sistema moderno e legível
- **Componentes:** Design consistente e responsivo
- **Animações:** Transições suaves e interativas

## 📊 **Performance**

- **Build:** Otimizado com Vite
- **CSS:** Tailwind CSS purged
- **JavaScript:** Bundle otimizado
- **Images:** Otimizadas e responsivas

## 🔒 **Segurança**

- **Headers:** Configurados no netlify.toml
- **CORS:** Configurado nas Netlify Functions
- **Environment:** Variáveis sensíveis protegidas
- **HTTPS:** Forçado em produção

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 **Licença**

Este projeto é parte do INTERBØX 2025. Todos os direitos reservados.

## 📞 **Contato**

- **Projeto:** INTERBØX 2025
- **Desenvolvimento:** Flow Team
- **Email:** nettoaeb1@gmail.com

---

**Made with ❤️ for the Parkour Community**
