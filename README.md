# ✦ MindSpace

Área de trabalho pessoal para capturar **pensamentos, ideias, textos, poemas** e gerenciar **prompts** com categorias, tags e markdown.

---

## Stack

- **Next.js 15** (App Router)
- **Prisma ORM** + **PostgreSQL** (Vercel Postgres ou Neon)
- **NextAuth v5** (email/senha, GitHub, Google)
- **Tailwind CSS** — design dark editorial sofisticado
- **React Markdown** — renderização markdown completa

---

## Features

### 📝 Pensamentos
- 6 tipos: Nota, Ideia, Plano, Poema, Texto, Diário
- Editor markdown com preview ao vivo
- Fixar e favoritar
- Tags coloridas personalizáveis
- Busca em tempo real
- Filtros por tipo, tag, fixados, favoritos

### ⚡ Prompts
- Editor markdown com preview
- Categorias personalizáveis (ícone + cor)
- Tags
- Filtro por modelo/plataforma (Claude, GPT-4, Midjourney…)
- Botão de copiar com 1 clique (incrementa contador de uso)
- Ordenar por data ou mais usados

### 🏠 Dashboard
- Visão geral com estatísticas
- Atividade recente
- Ações rápidas

---

## Deploy no Vercel

### 1. Banco de dados

Crie um banco PostgreSQL gratuito no **[Neon](https://neon.tech)** ou use o **Vercel Postgres**.

No Neon:
1. Criar projeto → copiar as duas connection strings (`DATABASE_URL` com pooler, `DIRECT_URL` sem pooler)

### 2. Variáveis de ambiente

Crie `.env.local` baseado no `.env.example`:

```bash
cp .env.example .env.local
```

Preencha obrigatoriamente:
- `DATABASE_URL` — connection string com pooler
- `DIRECT_URL` — connection string direta (para migrations)
- `AUTH_SECRET` — gere com: `openssl rand -base64 32`
- `NEXTAUTH_URL` — URL do seu site (`https://seu-site.vercel.app`)

### 3. Rodar localmente

```bash
npm install
npm run db:push        # cria as tabelas no banco
npm run db:generate    # gera o Prisma Client
npm run dev            # http://localhost:3000
```

### 4. Deploy no Vercel

```bash
# Instale a CLI
npm i -g vercel

# Deploy
vercel

# Configure as env vars no dashboard do Vercel ou via CLI:
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add AUTH_SECRET
vercel env add NEXTAUTH_URL

# Re-deploy com as vars
vercel --prod
```

Ou conecte o repositório GitHub ao Vercel e adicione as variáveis no painel em **Settings → Environment Variables**.

### 5. OAuth (opcional)

**GitHub:**
1. https://github.com/settings/apps → New GitHub App
2. Callback URL: `https://seu-site.vercel.app/api/auth/callback/github`
3. Copie Client ID e Secret → adicione `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`

**Google:**
1. https://console.cloud.google.com → APIs & Services → Credentials
2. OAuth 2.0 Client ID → Web application
3. Redirect URI: `https://seu-site.vercel.app/api/auth/callback/google`
4. Copie Client ID e Secret → adicione `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

---

## Estrutura do projeto

```
mindspace/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth + Register
│   │   ├── thoughts/      # CRUD pensamentos
│   │   ├── prompts/       # CRUD prompts
│   │   ├── tags/          # CRUD tags
│   │   ├── categories/    # CRUD categorias
│   │   └── stats/         # Dashboard stats
│   ├── dashboard/
│   │   ├── thoughts/
│   │   ├── prompts/
│   │   ├── tags/
│   │   ├── categories/
│   │   └── settings/
│   ├── login/
│   └── register/
├── components/
│   ├── layout/            # Sidebar, DashboardHome
│   ├── thoughts/          # ThoughtsPage, Editor, Detail, Card
│   ├── prompts/           # PromptsPage, Editor, Detail, Card
│   └── ui/                # Toast system
├── lib/
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── auth.ts
└── middleware.ts
```

---

## Banco de dados — Modelos

| Modelo | Descrição |
|--------|-----------|
| `User` | Usuário autenticado |
| `Thought` | Pensamentos (6 tipos) |
| `Prompt` | Prompts com markdown |
| `Category` | Categorias de prompts |
| `Tag` | Tags coloridas compartilhadas |
| `ThoughtTag` | Relação thought ↔ tag |
| `PromptTag` | Relação prompt ↔ tag |
