-- Adicionar coluna horario em tratamentos (estava no estado React mas faltava no banco)
alter table tratamentos add column if not exists horario text default '09:00';
