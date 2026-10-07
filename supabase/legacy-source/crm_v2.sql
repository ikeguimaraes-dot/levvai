-- Adicionar colunas de pagamento na tabela tratamentos
alter table tratamentos add column if not exists forma_pagamento text default 'pix';
alter table tratamentos add column if not exists status_pagamento text default 'pendente';
alter table tratamentos add column if not exists data_pagamento date;
alter table tratamentos add column if not exists parcelas int default 1;

-- Tabela de produtos (sincronizada com o catálogo do portal)
create table if not exists produtos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  tipo text not null,
  cat text not null,
  nome text not null,
  protocolo text,
  regiao text,
  custo_un numeric default 0,
  preco_sugerido numeric default 0,
  estoque int default 0,
  estoque_min int default 3,
  obs text,
  ativo boolean default true
);

alter table produtos enable row level security;
create policy "allow all" on produtos for all using (true) with check (true);

-- Inserir produtos iniciais do catálogo Levvai
insert into produtos (tipo, cat, nome, protocolo, regiao, custo_un, preco_sugerido, estoque, estoque_min, obs) values
('Protocolo','Toxina','Botox 200U','Toxina Botulínica Full Face','Full Face / Hiperidrose',662.53,3500,5,3,'Allergan. 200U. Armazenar 2-8°C.'),
('Protocolo','Preenchedor','Evo H (1ml)','Preenchimento Corporal','Corporal / Bumbum',950,2500,15,5,'Protocolo requer 5-10 seringas.'),
('Protocolo','Preenchedor','Evo S (1ml)','Preenchimento Corporal','Corporal / Bumbum',950,2500,5,3,'Similar ao Evo H.'),
('Protocolo','Bioestimulador','Radiesse Duo (1,5ml)','Estímulo de Colágeno','Full Face / Corporal',446,1800,6,3,'Merz. Efeito imediato + bio. 12-18m.'),
('Protocolo','Preenchedor','Biogelis Volume (1ml)','Preenchimento Facial','Harmonização, mandíbula, olheiras',205,1500,8,4,'Marca nacional.'),
('Protocolo','Preenchedor','Juvederm Volbella (1ml)','Levvai Lips','Facial / Labial',325,2200,2,4,'Allergan. PREMIUM. ESTOQUE BAIXO.'),
('Protocolo','Preenchedor','Restylane Kysse (1ml)','Levvai Lips','Labial',339,2000,4,3,'Galderma. PREMIUM.'),
('Protocolo','Skin Booster','Profhilo (2ml)','Levvai Glow','Facial, corporal, colo, pescoço',375,1800,4,3,'IBSA. 2 sessões.'),
('Protocolo','Capilar','Mesohyal Redenx','Protocolo Capilar','Rosto, colo, mãos',800,2000,1,2,'Kit 5 ampolas. REPOR URGENTE.'),
('Protocolo','Revitalização','Bioflash NCTC-109','Mesoterapia','Couro cabeludo, rosto, colo',225,1000,6,3,'Protocolo 4-6 sessões.'),
('Protocolo','Fios','Fios de PDO','Levvai Lift','Facial, colo, pescoço',265.90,900,10,5,'Preço por fio.'),
('Protocolo','Regeneração','Kit Exomine','Regeneração Celular','Microagulhamento facial, capilar',2200,3500,2,2,'Tendência premium.'),
('Protocolo','Autólogo','Kit PRP','Plasma Rico em Plaquetas','Microagulhamento facial, capilar',160,1200,5,3,'Excelente margem.'),
('Produto','Emagrecimento','Tirzepatida (60mg/2,4ml)','Levvai Slim','Emagrecimento',1000,2000,48,10,'Mounjaro. Requer médico.')
on conflict do nothing;
