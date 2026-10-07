# CLAUDE.md — Contexto completo do projeto levvai-portal

Este arquivo existe para que o Claude Code (e qualquer instância do Claude) saiba exatamente onde o projeto está, o que já foi feito, e como continuar sem perder contexto.

---

## 1. VISÃO GERAL DO PROJETO

**Nome:** Instituto Levvai — Plataforma de Gestão Interna  
**Repositório:** github.com/grupomeeteat-lang/levvai-portal  
**Deploy:** Vercel (auto-deploy no push para `main`)  
**URL produção:** levvai-portal.vercel.app  
**Conta Vercel:** grupomeeteat-3433s  
**Dev local:** http://localhost:5173  

**O que é:** Portal web interno de gestão da clínica de estética Instituto Levvai (Vila Olímpia, SP). Usado pela equipe para CRM, agenda, financeiro, estoque, marketing, jurídico e governança.

**Proprietária:** Lara (Diretora Clínica)  
**CEO/admin:** Ike Guimarães (ikeguimaraes@gmail.com)  
**Co-admin:** Ricardo/Rich (grupomeeteat@gmail.com)  

---

## 2. STACK TÉCNICA

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite |
| Estilo | CSS inline (design system próprio) + `levvai-design-system.css` |
| Auth | Supabase Auth (email + senha) |
| Banco de dados | Supabase (PostgreSQL) |
| Deploy | Vercel (Hobby plan) |
| Serverless | `/api/*.js` (Vercel Functions) |
| Repositório | GitHub (`grupomeeteat-lang/levvai-portal`) |

**Versões:**
- Vite v5.4.21
- React 18
- @supabase/supabase-js

**Dev local:**
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build de produção
```

**Deploy:**
```bash
git add .
git commit -m "descrição"
git push origin main   # Vercel auto-deploya em ~1 min
```

**Git identity configurada:** `grupomeeteat@gmail.com` / `Henrique Guimaraes`  
(obrigatório para não bloquear deploys no Vercel Hobby)

---

## 3. VARIÁVEIS DE AMBIENTE

Configuradas no painel da Vercel (Settings → Environment Variables):

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | https://wlkshbycdtgvyabcolmd.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | chave pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | chave admin do Supabase (sensível) |
| `META_ACCESS_TOKEN` | token da Meta Graph API (Instagram) |
| `INSTAGRAM_USER_ID` | 17841472231421137 (@institutolevvai) |

**Arquivo local:** `.env.local` (não comitar — já no .gitignore)
```
VITE_SUPABASE_URL=https://wlkshbycdtgvyabcolmd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsa3NoYnljZHRndnlhYmNvbG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTYzMjQsImV4cCI6MjA4OTQzMjMyNH0.D5yN7ECOmQ5KA9zmuslaJKrW_ODmp-FiGvlx8MnYMRg
```

---

## 4. ESTRUTURA DE ARQUIVOS
```
levvai-portal/
├── CLAUDE.md                    ← este arquivo
├── README.md                    ← documentação básica
├── index.html                   ← entrada HTML
├── package.json
├── vite.config.js
├── .env.local                   ← variáveis locais (não commitar)
├── api/
│   ├── instagram.js             ← Meta Graph API v25.0
│   ├── admin-users.js           ← gestão de usuários Supabase Auth
│   └── crm.js                   ← CRUD completo do CRM
├── src/
│   ├── main.jsx                 ← bootstrap React
│   ├── supabase.js              ← cliente Supabase (anon key)
│   ├── App.jsx                  ← portal completo (~7500 linhas)
│   ├── levvai-design-system.css ← design tokens
│   └── components/
│       └── layout/
│           ├── AppShell.jsx     ← shell com sidebar
│           ├── Sidebar.jsx      ← navegação lateral
│           └── Topbar.jsx       ← barra superior
├── supabase/
│   └── migrations/
│       ├── crm.sql              ← tabelas CRM v1 (pacientes, tratamentos, prontuarios, propostas, observacoes)
│       ├── crm_v2.sql           ← colunas de pagamento + tabela produtos (14 seeds)
│       ├── crm_v3.sql           ← ADD COLUMN horario TEXT em tratamentos
│       ├── crm_v4.sql           ← ADD COLUMN tratamento_id + convertida_em em propostas
│       ├── cashflow.sql         ← tabela fluxo_caixa (data como DATE)
│       └── agendamentos.sql     ← tabela agendamentos + paciente_id FK
└── public/
```

---

## 5. AUTENTICAÇÃO

- **Provider:** Supabase Auth (email + senha)
- **Sessão:** persistente via `getSession` + `onAuthStateChange`
- **Client:** `src/supabase.js` usa `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- **Admin API:** `/api/admin-users.js` usa `SUPABASE_SERVICE_ROLE_KEY`

**Admin Masters** (podem resetar senhas, editar e-mails, gerenciar usuários):
- `ikeguimaraes@gmail.com` — Ike (CEO)
- `grupomeeteat@gmail.com` — Ricardo (Conselheiro)

**Outros usuários:** lara@, sirlandia@, sylmara@, gi@, admin@ (todos @institutolevvai.com.br)

**`userProfiles`** no App.jsx mapeia email → { name, role, color }. Admin Masters têm cargo fixo "CEO — Admin Master" que não pode ser alterado pela UI.

---

## 6. BANCO DE DADOS SUPABASE

**Projeto:** wlkshbycdtgvyabcolmd.supabase.co  
**Todas as tabelas têm RLS habilitado com policy `allow all` (auth feita no portal).**  
**Migrations aplicadas manualmente no Supabase SQL Editor — o projeto NÃO usa Supabase CLI.**

### Tabelas existentes (20 total):

`pacientes`, `tratamentos`, `prontuarios`, `propostas`, `observacoes`, `produtos`, `fluxo_caixa`, `agendamentos`, `associados`, `repasses_associados`, `contratos`, `atas`, `acoes_ata`, `feedbacks_nps`, `fornecedores`, `profissionais`, `editorial_calendario`, `avaliacoes_equipe`, `sessoes_oneone`, `quotes` (vazia, ignorar)

#### `pacientes`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | auto gerado |
| created_at | timestamptz | |
| nome | text NOT NULL | |
| email | text | |
| telefone | text | |
| cpf | text | |
| data_nascimento | text | |
| sexo | text | |
| indicado_por | text | |
| origem | text | default 'Instagram' |
| status | text | lead/contato/agendado/atendido/retorno/fidelizado/perdido |
| foto_url | text | |
| observacoes_gerais | text | |
| updated_at | timestamptz | atualizado no PATCH |

#### `tratamentos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| paciente_id | uuid FK → pacientes | cascade delete |
| data | date NOT NULL | |
| horario | text | default '09:00' — adicionado via crm_v3.sql |
| procedimento | text NOT NULL | |
| produto | text | |
| regiao | text | |
| sessao | int | default 1 |
| total_sessoes | int | default 1 |
| inicio_execucao | text | |
| fim_execucao | text | |
| status | text | pendente/em_andamento/finalizado/cancelado |
| profissional | text | |
| valor | numeric | |
| observacoes | text | |
| forma_pagamento | text | pix/dinheiro/débito/crédito Nx/transferência/cortesia |
| status_pagamento | text | pendente/pago/parcial/isento |
| data_pagamento | date | |
| parcelas | int | default 1 |

#### `prontuarios`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| paciente_id | uuid FK → pacientes | |
| data | date NOT NULL | |
| titulo | text NOT NULL | |
| conteudo | text | |
| profissional | text | |
| arquivos | text[] | |

#### `propostas`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| paciente_id | uuid FK → pacientes | |
| data | date NOT NULL | |
| titulo | text | |
| itens | jsonb | array de { id, nome, preco, custo, qty } |
| valor_total | numeric | |
| desconto | numeric | default 0 |
| parcelas | int | default 1 |
| status | text | rascunho/enviada/aprovada/recusada |
| observacoes | text | |
| tratamento_id | uuid FK → tratamentos.id | preenchido ao converter em venda |
| convertida_em | timestamptz | timestamp da conversão |

#### `observacoes`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| paciente_id | uuid FK → pacientes | |
| data | date NOT NULL | |
| conteudo | text NOT NULL | |
| autor | text | |
| tipo | text | geral/clínico/comercial/financeiro/alerta |

#### `produtos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| tipo | text | Protocolo/Produto |
| cat | text | Toxina/Preenchedor/Bioestimulador/etc |
| nome | text NOT NULL | |
| protocolo | text | nome do protocolo proprietário |
| regiao | text | |
| custo_un | numeric | custo unitário |
| preco_sugerido | numeric | preço de venda |
| estoque | int | |
| estoque_min | int | default 3 |
| obs | text | |
| ativo | boolean | default true (soft delete) |

**14 produtos inseridos:** Botox, Evo H, Evo S, Radiesse, Biogelis, Juvederm Volbella, Restylane Kysse, Profhilo, Mesohyal Redenx, Bioflash NCTC-109, Fios de PDO, Kit Exomine, Kit PRP, Tirzepatida.

#### `fluxo_caixa`
Tabela recriada com estrutura completa em Mai/2026.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| created_at | timestamptz | |
| tipo | text | receita / despesa |
| categoria | text | Insumos / Aluguel / Folha / Marketing / Equipamentos / Impostos / Serviços / Procedimento / Outros |
| descricao | text | |
| fornecedor | text | para despesas |
| valor | numeric | |
| forma_pagamento | text | para receitas (pix/dinheiro/débito/crédito/etc) |
| status | text | pago / em_aberto / vencido |
| data | date | data da movimentação |
| data_vencimento | date | principal campo de filtragem mensal |
| data_pagamento | date | preenchido ao confirmar pagamento |
| origem | text | crm / manual / recorrencia |
| recorrente | boolean | true = template de despesa fixa |
| dia_vencimento | int | dia do mês (para recorrentes) |
| paciente_id | uuid FK → pacientes | nullable, para receitas do CRM |
| paciente_nome | text | denormalizado para exibição |
| tratamento_id | uuid FK → tratamentos | nullable, para rastreio |
| procedimento | text | denormalizado do tratamento |

**Funções no banco:**
- `criar_receita_do_tratamento()` — trigger em `tratamentos`: insere receita automaticamente ao salvar tratamento com valor > 0
- `gerar_despesas_recorrentes(ano int, mes int)` — gera cópias mensais dos templates recorrentes (recorrente = true)
- `registrar_parcelas(p_fornecedor, p_descricao, p_categoria, p_valor_total, p_num_parcelas, p_data_primeira)` — cria N linhas com vencimentos mensais

**Despesas recorrentes cadastradas (11 templates):**  
Aluguel, Energia, Água, Internet, Contabilidade, Salário Sirlândia, Salário Giovana, Repasse Lara, Repasse Sylmara, Victa, Mercado Livre

**Meses pré-gerados:** Maio, Junho, Julho, Agosto/2026

**Auto-geração:** `fetchFluxoCaixa` detecta mês sem entradas com `origem = 'recorrencia'` e chama `gerar_despesas_recorrentes` automaticamente.

#### `agendamentos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| created_at | timestamptz | |
| data | date NOT NULL | |
| horario | text NOT NULL | |
| sala | text NOT NULL | |
| profissional | text | default 'Lara' |
| procedimento | text | default 'Consulta' |
| paciente | text | texto livre (fallback) |
| paciente_id | uuid FK → pacientes | opcional, adicionado posteriormente |
| from_crm | boolean | default false |
| origem | text | |

#### `associados`
Armazena profissionais associados (médicos, nutricionistas, etc.). Também usada no dropdown de PROFISSIONAL no form de tratamento da FichaPaciente.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| nome | text NOT NULL | exibido no dropdown como "Nome — Especialidade" |
| especialidade | text | ex: "Harmonização Facial" |
| ativo | boolean | soft delete — `.eq('ativo', true)` ao carregar |
| (outros campos) | | contato, repasse, etc. |

#### `repasses_associados`
Armazena repasses financeiros para associados. Campos: `id`, `associado_id` FK, `data`, `valor`, `procedimento`, `status_pagamento`, `pago`.

#### `contratos`
Armazena contratos com fornecedores, associados e serviços. Campos incluem `vencimento` (date) para alertas de vencimento.

#### `atas`
Atas de reuniões (Weekly Levvai, Board Mensal). Campos: `id`, `tipo`, `data`, `pauta`, `presentes`, `decisoes`.
**Nota:** o alias `const meetings = atas` é mantido no App.jsx para compatibilidade com o render existente.

#### `acoes_ata`
Ações derivadas de cada ata. Campos: `id`, `ata_id` FK → atas, `acao`, `resp`, `prazo`, `status` (aberta/concluida/atrasada/cancelada).

#### `feedbacks_nps`
Feedbacks NPS dos pacientes. Campos: `id`, `nome`, `proc`, `nota` (0-10), `data`, `comentario`, `indicaria` (boolean).
**Nota:** o alias `const feedbacks = feedbacksNps` é mantido no App.jsx.

#### `fornecedores`
Cadastro de fornecedores. Campos: `id`, `nome`, `produtos`, `contato`, `tel`, `email`, `prazo`, `pagamento`, `obs`, `ativo` (soft delete).
**Nota:** o alias `const suppliers = fornecedores` é mantido no App.jsx.

#### `profissionais`
Profissionais da agenda. Campos: `id`, `nome`, `specialty`, `color`, `rooms` (array), `days`, `ativo`.
**Nota:** o alias `const professionals = profissionais` é mantido no App.jsx. Filtro `.eq('ativo', true)` ao carregar.

---

## 7. SERVERLESS APIs (`/api/`)

### `api/crm.js`
**CRUD completo via query params:**
- `GET /api/crm?resource=pacientes` — lista todos
- `GET /api/crm?resource=pacientes&id=UUID` — busca um
- `POST /api/crm?resource=pacientes` — cria
- `PATCH /api/crm?resource=pacientes&id=UUID` — atualiza
- `DELETE /api/crm?resource=pacientes&id=UUID` — deleta
- `GET /api/crm?resource=produtos` — lista produtos ativos
- `GET /api/crm?resource=tratamentos&paciente_id=UUID` — sub-recursos por paciente
- Mesma lógica para: `prontuarios`, `propostas`, `observacoes`

### `api/admin-users.js`
Usa `SUPABASE_SERVICE_ROLE_KEY`:
- `GET` — lista todos os usuários Auth
- `POST { email, password, nome, cargo }` — cria usuário
- `PATCH { userId, nome, cargo, password?, email?, foto? }` — atualiza
- `DELETE { userId }` — remove

### `api/instagram.js`
- `GET` — busca dados do @institutolevvai via Meta Graph API v25.0
- Token expira a cada 60 dias — renovar no Meta Graph API Explorer

---

## 8. DESIGN SYSTEM

**Paleta:**
```js
const GOLD = "#C8A96E"      // dourado — cor principal de destaque
const DARK = "#1A1A1A"      // fundo dark, headers
const LIGHT = "#F5F0E8"     // fundo claro, cards secundários
const BG = "#FAFAF8"        // fundo geral da página
```

**Fontes:** Instrument Serif (display), DM Sans (body), DM Mono (técnico)  
**Border radius padrão:** 8-12px  
**Sombra cards:** `0 1px 3px rgba(0,0,0,0.04)`

**Componentes base no App.jsx:**
- `<Card>` — container padrão com título
- `<Metric>` — KPI display
- `<Badge>` — pill colorido
- `<TableRow>` — linha de tabela
- `<PersonCard>` — card de pessoa da equipe

---

## 9. NAVEGAÇÃO / TABS

O portal usa sidebar vertical com 29 abas em 9 setores:

| Setor | Abas |
|-------|------|
| Estratégia | Visão Geral, Planejamento, Dashboard CEO |
| Cultura & Governança | Cultura, Atas & Ações |
| Financeiro | DRE & Catálogo, Fluxo de Caixa, Orçamento |
| Comercial | CRM & Leads, Comunicação, Jornada Paciente, NPS |
| Marketing | Marca, ICP, Editorial, Dashboard Mkt, Concorrentes |
| Pessoas | Equipe, Associados, 1:1s, Avaliação |
| Operação | Agenda, Estoque, Rotinas, Fornecedores |
| Jurídico | Compliance, Contratos |
| Docs | Documentos, Usuários |

**Mapeamento IDs:** `NEW_TO_OLD_ID` (novo ID sidebar → ID componente)  
**Mapeamento inverso:** `OLD_TO_NEW_ID` (usado no `navigateTo`)  
**Breadcrumb:** `TAB_TO_SECTOR` (ID → { sector, label })

---

## 10. CRM — FUNCIONAMENTO

### CRMTab
- Lista pacientes do Supabase (`/api/crm?resource=pacientes`)
- Funil de filtros por status (lead/contato/agendado/atendido/retorno/fidelizado/perdido)
- Busca por nome, telefone, e-mail
- Clique abre `FichaPaciente` (modal fullscreen)

### FichaPaciente (modal)
5 abas internas:
1. **Sobre** — dados cadastrais, edição inline
2. **Tratamentos** — lista com status de tratamento + status de pagamento inline editável, totais financeiros, botão 📅 Google Calendar; form de novo tratamento tem checkbox "Registrar entrada no prontuário" que expande campos título + anotações clínicas (salva ambos em uma operação via `salvarTratamentoComProntuario`)
3. **Prontuário** — registros clínicos por data
4. **Propostas** — orçamentos com itens do catálogo (produtos do Supabase), cálculo de desconto/parcelas, botão imprimir/PDF; botão "✓ Converter em Venda" em propostas não aprovadas abre modal de confirmação e chama `converterPropostaEmVenda` (cria tratamento finalizado + marca proposta como aprovada + trigger dispara receita no fluxo_caixa)
5. **Observações** — anotações por tipo (geral/clínico/comercial/financeiro/alerta)

### Funções em FichaPaciente (adicionadas Mai/2026)
- `salvarTratamentoComProntuario()` — salva tratamento + prontuário linkados (mesmo paciente_id/profissional/data). Usa `setTratamentos`/`setProntuarios` local (não `setPacientes`).
- `converterPropostaEmVenda()` — cria tratamento com `status: 'finalizado'` a partir da proposta; atualiza proposta para `status: 'aprovada'`; trigger `criar_receita_do_tratamento` gera receita automaticamente no fluxo_caixa.

### Estado local da FichaPaciente
```
tratamentos, prontuarios, propostas, observacoes   ← dados do paciente (loadSub)
produtosDB        ← catálogo de procedimentos (select ativo=true)
associadosDB      ← profissionais para dropdown (select ativo=true, order nome)
comProntuario     ← checkbox "Registrar entrada no prontuário"
newProntuarioInline  ← { titulo, conteudo } para prontuário inline
propostaConverting   ← proposta em processo de conversão em venda (ou null)
convertForm          ← campos do modal de conversão
```

**Importante:** `FichaPaciente` é componente standalone (fora de `LevvaiPortal`). Não tem acesso a `setPacientes`. Toda atualização de state local usa `setTratamentos`, `setPropostas`, `setProntuarios` — nunca `setPacientes`.

### Google Calendar (Opção B — link direto)
Botão 📅 em cada tratamento gera link `calendar.google.com/calendar/render?action=TEMPLATE&...` com nome do paciente, procedimento, data, hora e localização preenchidos.

---

## 11. AGENDA

- Grade visual semana × salas (Sala da Lara, Sala Associados, Consultório, Soroterapia)
- Navegação por semana com datas reais
- Agendamento inline clicando no slot
- Botão 📅 Google Calendar em cada slot agendado
- Slots sincronizados com CRM via `shared.slots`

---

## 12. INSTAGRAM INTEGRATION

- App Meta: `LEVVAI_PORTAL` no Business Manager Meet & Eat
- Facebook Page ID: `818979271308603`
- Instagram ID: `17841472231421137` (@institutolevvai)
- Serverless: `/api/instagram.js`
- Auto-refresh a cada 5 min no Dashboard Marketing
- **Token expira a cada 60 dias** — renovar no Meta Graph API Explorer com o app LEVVAI_PORTAL

---

## 13. GESTÃO DE USUÁRIOS

Aba **Docs → Usuários** no portal:
- Lista todos os usuários Supabase Auth com nome, e-mail, cargo, status
- Clique abre painel lateral com edição de nome, cargo, e-mail (admin master), senha (admin master), foto
- Admin Masters têm cargo fixo "CEO — Admin Master" (não editável pela UI)
- Apenas Admin Masters veem campo de senha e e-mail editáveis
- Apenas Admin Masters veem botão "Adicionar usuário"
- Non-admin masters veem aviso de bloqueio no campo senha

**Cargos disponíveis:** CEO — Admin Master, Dir. Clínica, Ger. Operacional, Administradora, Social Media, Conselheiro, Associado, Visualizador

---

## 14. PADRÕES DE CÓDIGO IMPORTANTES

### Nunca fazer:
- Não usar `localStorage` ou `sessionStorage` (não funciona no ambiente)
- Não mudar o git identity (deve ser `grupomeeteat@gmail.com`)
- Não fazer deploy manual via `vercel --prod` — sempre via git push
- Não modificar outros arquivos além dos especificados nas tarefas

### SVG / gráficos:
- SVG line charts precisam de `style={{ background: 'transparent' }}` no elemento SVG
- `<path>` de área deve usar `fill={\`url(#${gradientId})\`}` — não `fill="black"`

### Ao entregar código:
- Sempre usar marcadores `===== INICIO ARQUIVO =====` / `===== FIM ARQUIVO =====` para arquivos completos
- Nunca adaptar, nunca reinterpretar — copiar literalmente quando instruído

### Build:
- Warning de chunk size (>500KB) é normal — não é erro, pode ignorar
- `npm run build` deve terminar com `✓ built in Xs`

---

## 15. HISTÓRICO DE DECISÕES

| Data | Decisão |
|------|---------|
| Abr/2026 | Auth migrado de hardcoded → Supabase Auth com sessão persistente |
| Abr/2026 | Sidebar vertical substituiu tabs horizontais (29 abas inutilizáveis) |
| Abr/2026 | CRM migrado de estado local → Supabase (5 tabelas) |
| Abr/2026 | Google Calendar: Opção B (link direto) em vez de API completa |
| Abr/2026 | Produtos do catálogo salvos no Supabase (tabela `produtos`) |
| Abr/2026 | Admin Masters definidos por array de e-mails hardcoded (não por role no DB) |
| Mai/2026 | Fase 1: Associados, Repasses, Contratos migrados para Supabase |
| Mai/2026 | Fase 2: Atas, Ações, NPS, Fornecedores, Profissionais migrados para Supabase |
| Mai/2026 | tratamentos.horario adicionado via ALTER TABLE (dado era descartado silenciosamente) |
| Mai/2026 | fluxo_caixa.data convertido de TEXT para DATE real (coluna temp + UPDATE + DROP + RENAME) |
| Mai/2026 | agendamentos.paciente_id adicionado como FK opcional para pacientes.id |
| Mai/2026 | Padrão alias de compatibilidade adotado: `const oldVar = newVar` para manter render intacto após rename de state |
| Mai/2026 | Fase 3: Editorial, Avaliação e 1:1s conectados ao Supabase — portal 100% sem useState hardcoded operacional |
| Mai/2026 | fluxo_caixa recriada com estrutura completa: FKs para CRM, trigger automático, parcelamento, recorrência |
| Mai/2026 | FichaPaciente: checkbox prontuário integrado no form de tratamento; botão "Converter em Venda" em propostas com modal de confirmação |
| Mai/2026 | propostas: colunas tratamento_id FK + convertida_em adicionadas para rastrear conversão em venda |
| Mai/2026 | FichaPaciente: campo PROFISSIONAL vira select populado de associados ativos; fallback para input texto se tabela vazia |

---

## 16. APP.JSX — ESTADO DAS MIGRAÇÕES DE STATE

**Portal 100% conectado ao Supabase. Nenhuma aba operacional depende de useState hardcoded.**

| Aba | Estado anterior | Estado atual |
|-----|----------------|--------------|
| AssociatesTab | useState hardcoded | `associados` + `repasses_associados` (Supabase) |
| ContratosTab | useState hardcoded | `contratos` (Supabase) |
| AtasTab | useState hardcoded (meetings) | `atas` + `acoes_ata` (alias `meetings = atas`) |
| NpsTab | useState hardcoded (feedbacks) | `feedbacks_nps` (alias `feedbacks = feedbacksNps`) |
| FornecedoresTab | useState hardcoded (suppliers) | `fornecedores` (alias `suppliers = fornecedores`) |
| AgendaTab (profissionais) | useState hardcoded (professionals) | `profissionais` (alias `professionals = profissionais`) |
| AgendaTab (slots) | shared.slots in-memory | `agendamentos` (Supabase, chave por data real) |
| StockTab | useState hardcoded | `produtos` (Supabase, `mapProduto()` para snake_case) |
| CashflowTab | useState hardcoded | `fluxo_caixa` (Supabase); seções ENTRADAS/SAÍDAS; parcelamento; recorrência automática |
| EditorialTab | useState posts: {} hardcoded | `editorial_calendario` (Supabase); `const posts = {}` mantém render |
| AvaliacaoTab | team array hardcoded | `avaliacoes_equipe` (Supabase); `team` permanece como config estática |
| OneOneTab | useState sessions hardcoded | `sessoes_oneone` (Supabase); alias `const sessions = sessoesOneOne` |

**Funções adicionadas ao App.jsx (todas as fases):**  
Fase 1: `salvarAssociado`, `salvarRepasse`, `marcarRepassePago`, `salvarContrato`, `excluirContrato`, `contratosAlerta`  
Fase 2: `salvarAta`, `salvarAcaoAta`, `concluirAcao`, `acoesPorAta`, `acoesAbertas`, `salvarFeedbackNps`, `calcularNps`, `salvarFornecedor`, `arquivarFornecedor`, `salvarProfissional`, `desativarProfissional`  
Fase 3: `salvarPost`, `atualizarStatusPost`, `excluirPost`, `postsPorData`, `postsDoMes`, `salvarAvaliacao`, `ultimaAvaliacao`, `mediaTime`, `salvarSessaoOneOne`, `excluirSessaoOneOne`, `sessoesPorParticipante`  
CashflowTab: `fetchFluxoCaixa`, `confirmarStatus`, `registrarDespesa` (com parcelas via RPC), `excluirEntrada`, `gerarRecorrentes`, `totalReceitas`, `totalDespesas`, `resultadoBruto`, `receitasPorForma`  
FichaPaciente (Mai/2026): `salvarTratamentoComProntuario`, `converterPropostaEmVenda`

**Pendências conhecidas:**
- `AvaliacaoTab` — array `team` com Lara, Sirlândia, Sylmara e Gi ainda hardcoded como estrutura base. Avaliações persistem no banco mas cadastro de novos colaboradores exige ajuste manual nesse array.
- `OneOneTab` — `toggleAction` mantém toggle local. Update no banco fica pendente até schema de ações individuais ser definido.

---

## 17. BANCO DE DADOS — ESTADO FINAL

**20 tabelas no Supabase** (projeto wlkshbycdtgvyabcolmd). Todas com RLS `allow all`.  
**3 funções/triggers:** `criar_receita_do_tratamento`, `gerar_despesas_recorrentes`, `registrar_parcelas`

`pacientes`, `tratamentos`, `prontuarios`, `propostas`, `observacoes`, `produtos`, `fluxo_caixa`, `agendamentos`, `associados`, `repasses_associados`, `contratos`, `atas`, `acoes_ata`, `feedbacks_nps`, `fornecedores`, `profissionais`, `editorial_calendario`, `avaliacoes_equipe`, `sessoes_oneone`, `quotes` (vazia — ignorar)

**Migrations aplicadas** (manualmente no Supabase SQL Editor):

| Arquivo | O que faz |
|---------|-----------|
| `crm.sql` | Cria tabelas CRM v1 |
| `crm_v2.sql` | Colunas de pagamento + tabela produtos com 14 seeds |
| `crm_v3.sql` | `ALTER TABLE tratamentos ADD COLUMN horario` |
| `crm_v4.sql` | `ALTER TABLE propostas ADD COLUMN tratamento_id, convertida_em` |
| `cashflow.sql` | Tabela fluxo_caixa estrutura completa |
| `agendamentos.sql` | Tabela agendamentos + paciente_id FK |

---

## 18. PRÓXIMOS PASSOS CONHECIDOS

- [ ] Sincronização bidirecional com Google Calendar (Opção C futura)
- [ ] Token Instagram expira a cada 60 dias — renovar no Meta Graph API Explorer
- [ ] DRE ainda usa dados mockados — conectar ao Supabase futuramente
- [ ] EditorialTab — reconectar grid semanal às datas reais do banco (atualmente `const posts = {}` stub)
- [ ] OneOneTab — implementar `toggleAction` com update no banco quando schema de ações estiver definido

---

## 19. CONTATOS E ACESSOS

| Recurso | Info |
|---------|------|
| GitHub org | grupomeeteat-lang |
| Vercel account | grupomeeteat-3433s |
| Supabase project | wlkshbycdtgvyabcolmd |
| Instagram | @institutolevvai (ID: 17841472231421137) |
| Facebook Page | ID: 818979271308603 |
| Endereço clínica | Rua do Rocio, 288, cj 93 — Vila Olímpia, SP |
| WhatsApp clínica | (11) 97821-2800 |
