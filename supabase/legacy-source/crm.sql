-- PACIENTES
create table if not exists pacientes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  nome text not null,
  email text,
  telefone text,
  cpf text,
  data_nascimento text,
  sexo text,
  indicado_por text,
  origem text default 'Instagram',
  status text default 'lead',
  foto_url text,
  observacoes_gerais text,
  updated_at timestamp with time zone default now()
);

-- TRATAMENTOS
create table if not exists tratamentos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  paciente_id uuid references pacientes(id) on delete cascade,
  data date not null,
  procedimento text not null,
  produto text,
  regiao text,
  sessao int default 1,
  total_sessoes int default 1,
  inicio_execucao text,
  fim_execucao text,
  status text default 'pendente',
  profissional text,
  valor numeric,
  observacoes text
);

-- PRONTUARIOS
create table if not exists prontuarios (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  paciente_id uuid references pacientes(id) on delete cascade,
  data date not null,
  titulo text not null,
  conteudo text,
  profissional text,
  arquivos text[]
);

-- PROPOSTAS
create table if not exists propostas (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  paciente_id uuid references pacientes(id) on delete cascade,
  data date not null,
  titulo text,
  itens jsonb,
  valor_total numeric,
  desconto numeric default 0,
  parcelas int default 1,
  status text default 'rascunho',
  observacoes text
);

-- OBSERVACOES
create table if not exists observacoes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  paciente_id uuid references pacientes(id) on delete cascade,
  data date not null,
  conteudo text not null,
  autor text,
  tipo text default 'geral'
);

-- RLS: habilitar mas permitir tudo por enquanto (auth via portal)
alter table pacientes enable row level security;
alter table tratamentos enable row level security;
alter table prontuarios enable row level security;
alter table propostas enable row level security;
alter table observacoes enable row level security;

create policy "allow all" on pacientes for all using (true) with check (true);
create policy "allow all" on tratamentos for all using (true) with check (true);
create policy "allow all" on prontuarios for all using (true) with check (true);
create policy "allow all" on propostas for all using (true) with check (true);
create policy "allow all" on observacoes for all using (true) with check (true);
