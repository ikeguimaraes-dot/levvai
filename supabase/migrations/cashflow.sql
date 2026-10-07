-- Tabela de fluxo de caixa
create table if not exists fluxo_caixa (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  data text not null,
  descricao text not null,
  tipo text not null check (tipo in ('entrada', 'saida')),
  valor numeric not null default 0,
  categoria text not null default 'Procedimento'
);

alter table fluxo_caixa enable row level security;
create policy "allow all" on fluxo_caixa for all using (true) with check (true);

-- Dados iniciais de exemplo
insert into fluxo_caixa (data, descricao, tipo, valor, categoria) values
('15/04', 'Procedimento — Botox Full Face', 'entrada', 3500, 'Procedimento'),
('15/04', 'Aluguel cj 93', 'saida', 4500, 'Aluguel'),
('16/04', 'Procedimento — Levvai Lips', 'entrada', 2200, 'Procedimento'),
('18/04', 'Compra Profhilo (2 un)', 'saida', 1500, 'Fornecedor'),
('20/04', 'Procedimento — Tirzepatida', 'entrada', 2000, 'Produto'),
('22/04', 'Folha Sirlândia', 'saida', 3000, 'Pessoas');
