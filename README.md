# Instituto Levvai — Plataforma de Gestão

## Clone independente

Repositório de destino: https://github.com/ikeguimaraes-dot/levvai

Esta cópia inclui o código atual e as correções locais de autenticação. O histórico
Git do repositório original não foi importado. O banco de dados ainda NÃO foi
copiado. Não executar as migrations como se fossem um backup completo: elas
contêm apenas parte da estrutura e não contêm os registros de produção.

O Supabase proposto (`ivabmzjlcnmzwhmfqeam`, nome `hos-alter`) já possui outro
sistema, com 31 tabelas públicas, um usuário e um bucket. Confirmar o destino
antes de importar qualquer banco. O projeto original `wlkshbycdtgvyabcolmd`
não está acessível pela conexão Supabase atual.

Para concluir: obter acesso/backup do banco original, copiar schema e dados
(incluindo Auth), transferir os arquivos Storage, revisar configurações Auth e
integrações, comparar contagens e testar login/permissões. Manter backups,
dados pessoais e chaves de serviço fora do Git. Copiar `.env.example` para
`.env.local` e preencher as chaves somente após confirmar o destino.

O conteúdo abaixo e `CLAUDE.md` documentam a instalação ORIGINAL, não um deploy
do clone.

Portal interno de gestão da clínica de estética Instituto Levvai.

> **Para contexto completo do projeto, leia o [CLAUDE.md](./CLAUDE.md)**

## Setup rápido

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de produção
```

## Deploy

Push para `main` → Vercel auto-deploya em ~1 minuto.

```bash
git add .
git commit -m "descrição"
git push origin main
```

## Variáveis de ambiente

Crie `.env.local` na raiz:
```
VITE_SUPABASE_URL=https://wlkshbycdtgvyabcolmd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsa3NoYnljZHRndnlhYmNvbG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTYzMjQsImV4cCI6MjA4OTQzMjMyNH0.D5yN7ECOmQ5KA9zmuslaJKrW_ODmp-FiGvlx8MnYMRg
```

Variáveis adicionais configuradas no painel da Vercel:
- `SUPABASE_SERVICE_ROLE_KEY`
- `META_ACCESS_TOKEN`
- `INSTAGRAM_USER_ID`

## Stack

- React + Vite
- Supabase (Auth + PostgreSQL)
- Vercel (deploy + serverless functions)

## Estrutura
```
├── api/           ← serverless functions (crm, instagram, admin-users)
├── src/
│   ├── App.jsx    ← portal completo
│   ├── supabase.js
│   └── components/
└── supabase/migrations/   ← SQL das tabelas
```
