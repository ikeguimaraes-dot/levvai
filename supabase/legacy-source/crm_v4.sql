-- Adicionar colunas de rastreio de conversão em propostas
alter table propostas add column if not exists tratamento_id uuid references tratamentos(id) on delete set null;
alter table propostas add column if not exists convertida_em timestamptz;
