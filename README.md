# 🎯 INTERBØX Captação 2025

> Sistema oficial de captação para **Judge**, **Staff** e **Audiovisual** do maior evento de times da América Latina.
>
> **Mantra:** design é poesia com régua — simples porque é pensado.

<p align="left">
  <a href="#-sobre-o-projeto"><img alt="status" src="https://img.shields.io/badge/status-prod_ready-7C3AED?style=for-the-badge"></a>
  <a href="#-urls-de-producao"><img alt="deploy" src="https://img.shields.io/badge/deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white"></a>
  <a><img alt="license" src="https://img.shields.io/badge/licen%C3%A7a-Propriet%C3%A1ria-111827?style=for-the-badge"></a>
  <a><img alt="token" src="https://img.shields.io/badge/NE%C3%98-$NE%C3%98-9333EA?style=for-the-badge"></a>
</p>

---

## 📚 Sumário

* [🚀 Sobre o Projeto](#-sobre-o-projeto)
* [🔐 Uso e Distribuição (Cláusula de não autorização)](#-uso-e-distribuição)
* [🛠️ Tecnologias](#️-tecnologias-utilizadas)
* [📁 Estrutura](#-estrutura-do-projeto)
* [🚀 Como Executar](#-como-executar-localmente)
* [🧱 Build de Produção](#-build-de-produção)
* [🌐 URLs de Produção](#-urls-de-produção)
* [💳 Pagamentos (OpenPix/Woovi)](#-integração-com-openpixwoovi)
* [🛡️ Netlify](#️-configuração-netlify)
* [📱 Funcionalidades por Área](#-funcionalidades-por-área)
* [🎨 Design System](#-design-system)
* [📊 Performance & Otimização](#-performance--otimização)
* [🔐 Segurança](#-segurança)
* [⚙️ Variáveis de Ambiente](#️-variáveis-de-ambiente)
* [🤝 Contribuição](#-contribuição)
* [📄 Licença & Protocolo](#-licença--protocolo)
* [📞 Contato](#-contato-oficial)

---

## 🚀 **Sobre o Projeto**

O **INTERBØX Captação** é uma aplicação web moderna para gestão estratégica das inscrições de:

* **Judge** — júri técnico do evento
* **Staff** — equipe de operação e logística
* (Audiovisual descontinuado)

Integra-se ao ecossistema digital do **INTERBØX 2025**, operando sob os princípios do **NEØ Protocol** — uma camada simbólica de governança e tokenização conectada ao token **`$NEØ`**.

---

## 🔐 **Uso e Distribuição**

**Este sistema é de uso exclusivo do projeto INTERBØX 2025.**

> 🚫 **É expressamente proibido copiar, redistribuir, publicar, descompilar, reutilizar ou adaptar qualquer parte deste código, design, marca ou documentação para fins comerciais ou pessoais sem autorização por escrito da equipe FlowOFF e do NEØ Protocol.**

Violação destas condições pode acarretar sanções legais conforme a Lei de Direitos Autorais vigente (Lei nº **9.610/98 – Brasil**). Em caso de coleta de dados, o projeto observa os princípios da **LGPD (Lei nº 13.709/18)**.

---

## 🛠️ **Tecnologias Utilizadas**

* **Frontend:** React 19 · TypeScript · Vite
* **Styling:** Tailwind CSS
* **Backend/Serverless:** Netlify Functions
* **Pagamentos:** OpenPix / Woovi API
* **Deploy:** Netlify

---

## 📁 **Estrutura do Projeto**

```txt
src/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── SEOHead.tsx
│   └── CheckoutCard.tsx
├── pages/
│   ├── captacao/
│   ├── judge/
│   ├── staff/
│   └── audiovisual/
├── hooks/
│   └── useAnalytics.ts
└── config/
    └── openpix-config.js

netlify/
└── functions/
    ├── create-charge.js
    ├── check-charge.js
    └── webhook.js
```

---

## 🚀 **Como Executar Localmente**

> Requisitos mínimos: **Node 18+** e **npm 9+**

```bash
# 1) Instalar dependências
npm install

# 2) Rodar em modo dev
npm run dev

# App em: http://localhost:5173
```

### **Build de Produção**

```bash
npm run build
npm run preview
```

---

## 🌐 **URLs de Produção**

* 🔗 Aplicação principal: [https://interbox-captacao.netlify.app](https://interbox-captacao.netlify.app)
* 🧑‍⚖️ Judge & Staff: [https://interbox-captacao.netlify.app/captacao/judge-staff](https://interbox-captacao.netlify.app/captacao/judge-staff)
* (Audiovisual descontinuado)

> Dica: mantenha estes links no README para facilitar auditoria e QA.

---

## 💳 **Integração com OpenPix/Woovi**

* `POST /create-charge` — criação de cobranças
* `GET  /check-charge` — verificação de status
* `POST /webhook` — atualizações de pagamento

Configurações em: `src/config/openpix-config.js`

> Boas práticas: inclua `metadata` nas cobranças para reconciliar candidato/área/status.

---

## 🛡️ **Configuração Netlify**

* **Build Command:** `npm run build`
* **Publish Directory:** `dist`
* **Functions Directory:** `netlify/functions`
* **Env Vars:** definidas via painel da Netlify

> Ative **HTTPS only**, **Edge Functions/Headers** e **Compressão** (Brotli/Gzip) no painel.

---

## 📱 **Funcionalidades por Área**

### Judge & Staff

* Informações completas
* Inscrição com checkout integrado
* Validação e confirmação automatizadas

### Audiovisual

* Apresentação da missão criativa
* Formulário com portfólio
* Sistema de pagamento e filtro por perfil

---

## 🎨 **Design System**

* **Paleta:** gradientes **pink/purple (INTERBØX)**
* **Tipografia:** moderna, legível e com hierarquia clara
* **Layout:** UI responsiva e clean
* **Motion:** transições suaves com Tailwind + preferências de redução de movimento

---

## 📊 **Performance & Otimização**

* Build **Vite** ultrarrápido
* **Tailwind** com purge ativado
* Assets otimizados (mobile first) e pronto para **PWA**

> Checklist: lazy-loading em rotas pesadas, prefetch de fontes, cache de imagens em CDN.

---

## 🔐 **Segurança**

* **HTTPS obrigatório**
* **Netlify Headers + CORS** controlado
* Secrets isolados por ambiente
* Webhooks com **assinatura/verificação**

---

## ⚙️ **Variáveis de Ambiente**

> Nomes sugeridos — ajuste conforme sua implementação:

```env
VITE_SITE_URL=
OPENPIX_APP_ID=
OPENPIX_API_KEY=
OPENPIX_WEBHOOK_SECRET=
```

Defina-as no painel da Netlify (ou `.env.local`, nunca commitar).

---

## 🤝 **Contribuição**

1. Faça **fork** do repositório
2. Crie uma branch: `feat/nome-da-feature`
3. Commits com contexto claro (convencional é bem-vindo)
4. **Push** e abra um **Pull Request**

> Padrões de PR: descrição objetiva, print/gif do fluxo e checklist de testes.

---

## 📄 **Licença & Protocolo**

Este sistema é parte do ecossistema **INTERBØX 2025**.
Desenvolvido por **FlowOFF** sob a filosofia do **NEØ Protocol**.
**Todos os direitos reservados.** Token simbólico: **`$NEØ`**.

> Este repositório **não** é open-source. Uso restrito mediante autorização formal.

---

## 📞 **Contato Oficial**

* 💻 Equipe Técnica: **MELLØ**
* 📩 Email: **[mello.flowreborn@gmail.com](mailto:mello.flowreborn@gmail.com)**


**Made with ❤️ & ⚡ for the next era of eventos**
