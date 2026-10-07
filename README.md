# Instituto Levvai — Plataforma de Gestão

## Clone independente

Repositório de destino: https://github.com/ikeguimaraes-dot/levvai

Clone e migração realizados em 07/10/2026. O histórico Git original não foi
importado. Destino: Supabase `ivabmzjlcnmzwhmfqeam` (**hos-alter**).

- Copiadas 21 tabelas e 337 registros, 4 funções e 12 triggers.
- Preservadas as 31 tabelas preexistentes, a conta Auth e o bucket do hos-alter.
- Cinco contas Auth importadas com os hashes de senha originais; a sexta conta
  já existia no destino e foi reutilizada sem alterar seus dados ou sua senha.
- Todos os seis usuários têm vínculo explícito em `levvai_members`.
- A conta compartilhada usa a senha que já tinha no hos-alter. Os outros cinco
  usuários mantêm a senha do Levvai. Todos precisam entrar novamente no clone.
- Não havia buckets, arquivos Storage ou fatores MFA no projeto de origem.
- Dados conferidos integralmente na transação; RLS e isolamento verificados.

A migration `20261007134508_import_levvai_isolated.sql` é uma estrutura completa
para instalação limpa, **sem registros, usuários ou segredos**. Já foi aplicada
ao destino por transação verificada; não executar novamente. Os SQLs antigos em
`supabase/legacy-source` são apenas histórico e não devem ser executados no hos-alter.
Backups e dados pessoais não pertencem ao Git.

O clone ainda precisa ser publicado em um projeto de hospedagem separado e ter
as variáveis de servidor configuradas. Não reutilizar o deploy original sem
uma decisão explícita. `CLAUDE.md` é documentação histórica da instalação original.

Portal interno de gestão da clínica de estética Instituto Levvai.

> **Para contexto completo do projeto, leia o [CLAUDE.md](./CLAUDE.md)**

## Setup rápido

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de produção
npm test           # testes de isolamento de autenticação
```

## Deploy

Conecte este repositório a um **novo** projeto Vercel. Configure as variáveis
abaixo antes do deploy. O frontend usa Vite; as rotas `api/` exigem funções
serverless (não funcionam apenas com `vite preview`). Não há deploy automático
do clone confirmado nesta migração.

```bash
git add .
git commit -m "descrição"
git push origin main
```

## Variáveis de ambiente

Crie `.env.local` na raiz:
```
VITE_SUPABASE_URL=https://ivabmzjlcnmzwhmfqeam.supabase.co
VITE_SUPABASE_ANON_KEY=<chave publishable do destino>
```

Variáveis adicionais configuradas no painel da Vercel:
- `SUPABASE_SERVICE_ROLE_KEY`
- `META_ACCESS_TOKEN`
- `INSTAGRAM_USER_ID`

Nunca usar prefixo `VITE_` para a chave `service_role` ou o token Meta.
O token Instagram original estava expirado e não foi migrado; a integração
exige renovação pelo responsável. O teste de login com senha real no novo
site ainda precisa ser realizado após a publicação.

### Isolamento no projeto compartilhado

RLS consulta `levvai_members` a cada operação. Uma conta Auth ou metadados
editáveis não concedem acesso. Só o backend privilegiado gerencia vínculos.
O painel lista apenas membros Levvai; não altera a conta compartilhada do HOS.
Remover acesso exclui apenas o vínculo Levvai, nunca a conta Auth do projeto.
As funções de negócio são SECURITY INVOKER e seguem a mesma RLS.

Os avisos de segurança restantes pertencem à configuração preexistente do
hos-alter: [search_path de data_fonte](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
e [proteção contra senhas vazadas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
Não foram alterados ajustes globais de Auth nem as políticas do HOS.

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
