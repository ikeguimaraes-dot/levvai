create table if not exists agendamentos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  data date not null,
  horario text not null,
  sala text not null,
  profissional text not null default 'Lara',
  procedimento text default 'Consulta',
  paciente text default 'Paciente',
  from_crm boolean default false,
  origem text
);

alter table agendamentos enable row level security;
create policy "allow all" on agendamentos for all using (true) with check (true);

create index if not exists agendamentos_data_idx on agendamentos(data);
