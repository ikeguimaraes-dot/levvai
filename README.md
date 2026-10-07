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

Clone publicado em **https://levvai.vercel.app**, no projeto Vercel separado
`henriques-projects-0f1cdf7f/levvai`, conectado a este repositório. O deploy
original não foi alterado. `CLAUDE.md` é documentação histórica da instalação original.

As duas variáveis públicas Supabase estão configuradas em Production. A variável
`SUPABASE_SERVICE_ROLE_KEY` foi autorizada pelo responsável e configurada como
segredo Sensitive, apenas em Production, em 07/10/2026. Ela é utilizada pelas
APIs de gestão de usuários e CRM; não está no Git nem no bundle do navegador.
O frontend acessa o banco diretamente com RLS. O teste de login e dos fluxos
autenticados com senha real continua pendente.

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

Push em `main` publica automaticamente no projeto Vercel **levvai**. O frontend
usa Vite; as rotas `api/` usam funções serverless (não funcionam apenas com
`vite preview`). Build e pasta de saída estão definidos em `vercel.json`.

Verificações do deploy inicial: página e JavaScript retornam HTTP 200; bundle
aponta para o novo Supabase; as três APIs retornam 401 sem sessão; nove testes
automatizados passaram. O teste de login com senha real continua pendente.
O build informou nove alertas de dependências (seis altos); sua atualização
precisa de revisão e testes próprios, sem executar `npm audit fix --force`.

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
