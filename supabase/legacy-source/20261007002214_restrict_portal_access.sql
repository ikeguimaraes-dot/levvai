-- Instituto Levvai is an internal portal: database rows are available only to
-- permanent, authenticated team members. Server routes using service_role keep
-- bypassing RLS, but now validate the caller before performing any operation.

do $migration$
declare
  table_name text;
  portal_tables constant text[] := array[
    'pacientes',
    'tratamentos',
    'prontuarios',
    'propostas',
    'observacoes',
    'produtos',
    'fluxo_caixa',
    'agendamentos',
    'associados',
    'repasses_associados',
    'contratos',
    'atas',
    'acoes_ata',
    'feedbacks_nps',
    'fornecedores',
    'profissionais',
    'editorial_calendario',
    'avaliacoes_equipe',
    'sessoes_oneone'
  ];
begin
  foreach table_name in array portal_tables loop
    if to_regclass(format('public.%I', table_name)) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all privileges on table public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format('drop policy if exists "allow all" on public.%I', table_name);
    execute format('drop policy if exists "portal permanent users" on public.%I', table_name);
    execute format(
      'create policy "portal permanent users" on public.%I for all to authenticated '
      'using ((select auth.uid()) is not null '
      'and coalesce((select (auth.jwt()->>''is_anonymous'')::boolean), false) is false '
      'and (coalesce((select (auth.jwt()->''app_metadata''->>''portal_access'')::boolean), false) is true '
      'or lower(coalesce((select auth.jwt()->>''email''), '''')) = any (array[''ikeguimaraes@gmail.com'', ''grupomeeteat@gmail.com'', ''lara@institutolevvai.com.br'', ''sirlandia@institutolevvai.com.br'', ''sylmara@institutolevvai.com.br'', ''gi@institutolevvai.com.br'', ''admin@institutolevvai.com.br'']))) '
      'with check ((select auth.uid()) is not null '
      'and coalesce((select (auth.jwt()->>''is_anonymous'')::boolean), false) is false '
      'and (coalesce((select (auth.jwt()->''app_metadata''->>''portal_access'')::boolean), false) is true '
      'or lower(coalesce((select auth.jwt()->>''email''), '''')) = any (array[''ikeguimaraes@gmail.com'', ''grupomeeteat@gmail.com'', ''lara@institutolevvai.com.br'', ''sirlandia@institutolevvai.com.br'', ''sylmara@institutolevvai.com.br'', ''gi@institutolevvai.com.br'', ''admin@institutolevvai.com.br''])))',
      table_name
    );
  end loop;
end
$migration$;
