-- Standalone clean import schema. Do not replay the legacy migrations on hos-alter.
BEGIN;
SET LOCAL search_path = public, extensions;
CREATE TABLE public."acoes_ata" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"ata_id" uuid,
"descricao" text NOT NULL,
"responsavel" text,
"prazo" date,
"status" text DEFAULT 'aberta'::text,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."agendamentos" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"created_at" timestamp with time zone DEFAULT now(),
"data" date NOT NULL,
"horario" text NOT NULL,
"sala" text NOT NULL,
"profissional" text DEFAULT 'Lara'::text NOT NULL,
"procedimento" text DEFAULT 'Consulta'::text,
"paciente" text DEFAULT 'Paciente'::text,
"from_crm" boolean DEFAULT false,
"origem" text,
"paciente_id" uuid,
"profissional_id" uuid
);
CREATE TABLE public."associados" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"nome" text NOT NULL,
"especialidade" text,
"crm" text,
"dias" text[],
"sala" text,
"split_modelo" text,
"split_percentual" numeric(5,2),
"ativo" boolean DEFAULT true,
"telefone" text,
"email" text,
"obs" text,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."atas" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"tipo" text NOT NULL,
"data" date NOT NULL,
"pauta" text,
"presentes" text[],
"decisoes" text[],
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."avaliacoes_equipe" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"colaborador" text NOT NULL,
"periodo" text NOT NULL,
"kpis" jsonb,
"nota_geral" numeric(4,2),
"pontos_fortes" text,
"pontos_desenvolvimento" text,
"plano_acao" text,
"avaliador" text,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."contratos" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"tipo" text NOT NULL,
"parte" text NOT NULL,
"inicio" date,
"vencimento" date,
"valor" numeric(12,2),
"status" text DEFAULT 'ativo'::text,
"responsavel" text,
"alerta_dias" integer DEFAULT 30,
"obs" text,
"arquivo_url" text,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."editorial_calendario" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"data" date NOT NULL,
"pilar" text,
"formato" text,
"descricao" text,
"status" text DEFAULT 'planejado'::text,
"responsavel" text,
"link_conteudo" text,
"obs" text,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."feedbacks_nps" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"paciente_id" uuid,
"nome" text,
"procedimento" text,
"nota" integer,
"comentario" text,
"indicaria" boolean,
"data" date DEFAULT CURRENT_DATE,
"criado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."fluxo_caixa" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"tipo" text NOT NULL,
"categoria" text,
"valor" numeric(12,2) DEFAULT 0,
"forma_pagamento" text,
"data" date DEFAULT CURRENT_DATE NOT NULL,
"data_vencimento" date,
"data_pagamento" date,
"status" text DEFAULT 'em_aberto'::text,
"paciente_id" uuid,
"paciente_nome" text,
"tratamento_id" uuid,
"procedimento" text,
"fornecedor" text,
"descricao" text,
"recorrente" boolean DEFAULT false,
"dia_vencimento" integer,
"recorrencia_origem_id" uuid,
"origem" text DEFAULT 'manual'::text,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."fornecedores" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"nome" text NOT NULL,
"produtos" text[],
"contato" text,
"telefone" text,
"email" text,
"prazo_entrega" text,
"condicao_pagamento" text,
"obs" text,
"ativo" boolean DEFAULT true,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."movimentacoes_estoque" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"created_at" timestamp with time zone DEFAULT now(),
"produto_id" uuid NOT NULL,
"tipo" text NOT NULL,
"quantidade" integer NOT NULL,
"saldo_apos" integer NOT NULL,
"obs" text,
"responsavel" text
);
CREATE TABLE public."observacoes" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"created_at" timestamp with time zone DEFAULT now(),
"paciente_id" uuid,
"data" date NOT NULL,
"conteudo" text NOT NULL,
"autor" text,
"tipo" text DEFAULT 'geral'::text
);
CREATE TABLE public."pacientes" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"created_at" timestamp with time zone DEFAULT now(),
"nome" text NOT NULL,
"email" text,
"telefone" text,
"cpf" text,
"data_nascimento" text,
"sexo" text,
"indicado_por" text,
"origem" text DEFAULT 'Instagram'::text,
"status" text DEFAULT 'lead'::text,
"foto_url" text,
"observacoes_gerais" text,
"updated_at" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."produtos" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"created_at" timestamp with time zone DEFAULT now(),
"tipo" text NOT NULL,
"cat" text NOT NULL,
"nome" text NOT NULL,
"protocolo" text,
"regiao" text,
"custo_un" numeric DEFAULT 0,
"preco_sugerido" numeric DEFAULT 0,
"estoque" integer DEFAULT 0,
"estoque_min" integer DEFAULT 3,
"obs" text,
"ativo" boolean DEFAULT true
);
CREATE TABLE public."profissionais" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"nome" text NOT NULL,
"especialidade" text,
"cor" text DEFAULT '#C9A876'::text,
"salas" text[],
"dias" text[],
"ativo" boolean DEFAULT true,
"telefone" text,
"email" text,
"obs" text,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."prontuarios" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"created_at" timestamp with time zone DEFAULT now(),
"paciente_id" uuid,
"data" date NOT NULL,
"titulo" text NOT NULL,
"conteudo" text,
"profissional" text,
"arquivos" text[]
);
CREATE TABLE public."propostas" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"created_at" timestamp with time zone DEFAULT now(),
"paciente_id" uuid,
"data" date NOT NULL,
"titulo" text,
"itens" jsonb,
"valor_total" numeric,
"desconto" numeric DEFAULT 0,
"parcelas" integer DEFAULT 1,
"status" text DEFAULT 'pendente'::text,
"observacoes" text,
"tratamento_id" uuid,
"convertida_em" timestamp with time zone,
"contatado_em" timestamp with time zone
);
CREATE TABLE public."quotes" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
"client_name" text NOT NULL,
"client_email" text NOT NULL,
"client_phone" text,
"event_type" text NOT NULL,
"guest_count" integer NOT NULL,
"plan_type" text NOT NULL,
"space_selected" text,
"menu_selections" jsonb,
"total_estimated_value" numeric(10,2) NOT NULL,
"status" text DEFAULT 'novo'::text
);
CREATE TABLE public."repasses_associados" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"associado_id" uuid,
"associado_nome" text,
"mes" text NOT NULL,
"bruto" numeric(12,2) DEFAULT 0,
"split_percentual" numeric(5,2),
"liquido" numeric(12,2) DEFAULT 0,
"pago" boolean DEFAULT false,
"data_pagamento" date,
"obs" text,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."sessoes_oneone" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"data" date NOT NULL,
"participantes" text[],
"topicos" text[],
"acoes" text[],
"humor" text,
"obs" text,
"criado_em" timestamp with time zone DEFAULT now(),
"atualizado_em" timestamp with time zone DEFAULT now()
);
CREATE TABLE public."tratamentos" (
"id" uuid DEFAULT gen_random_uuid() NOT NULL,
"created_at" timestamp with time zone DEFAULT now(),
"paciente_id" uuid,
"data" date NOT NULL,
"procedimento" text NOT NULL,
"produto" text,
"regiao" text,
"sessao" integer DEFAULT 1,
"total_sessoes" integer DEFAULT 1,
"inicio_execucao" text,
"fim_execucao" text,
"status" text DEFAULT 'pendente'::text,
"profissional" text,
"valor" numeric,
"observacoes" text,
"forma_pagamento" text DEFAULT 'pix'::text,
"status_pagamento" text DEFAULT 'pendente'::text,
"data_pagamento" date,
"parcelas" integer DEFAULT 1,
"horario" text,
"desconto" numeric DEFAULT 0,
"desconto_tipo" text DEFAULT 'percentual'::text
);
ALTER TABLE public."acoes_ata" ADD CONSTRAINT "acoes_ata_pkey" PRIMARY KEY (id);
ALTER TABLE public."acoes_ata" ADD CONSTRAINT "acoes_ata_status_check" CHECK ((status = ANY (ARRAY['aberta'::text, 'concluida'::text, 'cancelada'::text])));
ALTER TABLE public."agendamentos" ADD CONSTRAINT "agendamentos_pkey" PRIMARY KEY (id);
CREATE INDEX agendamentos_data_idx ON public.agendamentos USING btree (data);
ALTER TABLE public."associados" ADD CONSTRAINT "associados_pkey" PRIMARY KEY (id);
ALTER TABLE public."atas" ADD CONSTRAINT "atas_pkey" PRIMARY KEY (id);
ALTER TABLE public."avaliacoes_equipe" ADD CONSTRAINT "avaliacoes_equipe_pkey" PRIMARY KEY (id);
ALTER TABLE public."contratos" ADD CONSTRAINT "contratos_pkey" PRIMARY KEY (id);
ALTER TABLE public."contratos" ADD CONSTRAINT "contratos_status_check" CHECK ((status = ANY (ARRAY['ativo'::text, 'vencido'::text, 'encerrado'::text, 'renovando'::text])));
ALTER TABLE public."editorial_calendario" ADD CONSTRAINT "editorial_calendario_pkey" PRIMARY KEY (id);
ALTER TABLE public."editorial_calendario" ADD CONSTRAINT "editorial_calendario_status_check" CHECK ((status = ANY (ARRAY['planejado'::text, 'produzindo'::text, 'aprovado'::text, 'publicado'::text, 'cancelado'::text])));
ALTER TABLE public."feedbacks_nps" ADD CONSTRAINT "feedbacks_nps_nota_check" CHECK (((nota >= 0) AND (nota <= 10)));
ALTER TABLE public."feedbacks_nps" ADD CONSTRAINT "feedbacks_nps_pkey" PRIMARY KEY (id);
ALTER TABLE public."fluxo_caixa" ADD CONSTRAINT "fluxo_caixa_dia_vencimento_check" CHECK (((dia_vencimento >= 1) AND (dia_vencimento <= 31)));
ALTER TABLE public."fluxo_caixa" ADD CONSTRAINT "fluxo_caixa_forma_pagamento_check" CHECK ((forma_pagamento = ANY (ARRAY['credito'::text, 'debito'::text, 'pix'::text, 'dinheiro'::text, 'cortesia'::text, 'outro'::text])));
ALTER TABLE public."fluxo_caixa" ADD CONSTRAINT "fluxo_caixa_origem_check" CHECK ((origem = ANY (ARRAY['crm'::text, 'manual'::text, 'recorrencia'::text])));
ALTER TABLE public."fluxo_caixa" ADD CONSTRAINT "fluxo_caixa_pkey" PRIMARY KEY (id);
ALTER TABLE public."fluxo_caixa" ADD CONSTRAINT "fluxo_caixa_status_check" CHECK ((status = ANY (ARRAY['pago'::text, 'em_aberto'::text, 'vencido'::text])));
ALTER TABLE public."fluxo_caixa" ADD CONSTRAINT "fluxo_caixa_tipo_check" CHECK ((tipo = ANY (ARRAY['receita'::text, 'despesa'::text])));
ALTER TABLE public."fornecedores" ADD CONSTRAINT "fornecedores_pkey" PRIMARY KEY (id);
ALTER TABLE public."movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY (id);
ALTER TABLE public."movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_quantidade_check" CHECK ((quantidade > 0));
ALTER TABLE public."movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_tipo_check" CHECK ((tipo = ANY (ARRAY['ENTRADA'::text, 'SAIDA'::text])));
CREATE INDEX movimentacoes_estoque_produto_idx ON public.movimentacoes_estoque USING btree (produto_id, created_at DESC);
ALTER TABLE public."observacoes" ADD CONSTRAINT "observacoes_pkey" PRIMARY KEY (id);
ALTER TABLE public."pacientes" ADD CONSTRAINT "pacientes_pkey" PRIMARY KEY (id);
ALTER TABLE public."produtos" ADD CONSTRAINT "produtos_pkey" PRIMARY KEY (id);
ALTER TABLE public."profissionais" ADD CONSTRAINT "profissionais_pkey" PRIMARY KEY (id);
ALTER TABLE public."prontuarios" ADD CONSTRAINT "prontuarios_pkey" PRIMARY KEY (id);
ALTER TABLE public."propostas" ADD CONSTRAINT "propostas_pkey" PRIMARY KEY (id);
ALTER TABLE public."quotes" ADD CONSTRAINT "quotes_pkey" PRIMARY KEY (id);
ALTER TABLE public."repasses_associados" ADD CONSTRAINT "repasses_associados_pkey" PRIMARY KEY (id);
ALTER TABLE public."sessoes_oneone" ADD CONSTRAINT "sessoes_oneone_humor_check" CHECK ((humor = ANY (ARRAY['otimo'::text, 'bom'::text, 'neutro'::text, 'tenso'::text, 'critico'::text])));
ALTER TABLE public."sessoes_oneone" ADD CONSTRAINT "sessoes_oneone_pkey" PRIMARY KEY (id);
ALTER TABLE public."tratamentos" ADD CONSTRAINT "tratamentos_pkey" PRIMARY KEY (id);
ALTER TABLE public."acoes_ata" ADD CONSTRAINT "acoes_ata_ata_id_fkey" FOREIGN KEY (ata_id) REFERENCES atas(id) ON DELETE CASCADE;
ALTER TABLE public."agendamentos" ADD CONSTRAINT "agendamentos_paciente_id_fkey" FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL;
ALTER TABLE public."agendamentos" ADD CONSTRAINT "agendamentos_profissional_id_fkey" FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE SET NULL;
ALTER TABLE public."feedbacks_nps" ADD CONSTRAINT "feedbacks_nps_paciente_id_fkey" FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL;
ALTER TABLE public."fluxo_caixa" ADD CONSTRAINT "fluxo_caixa_paciente_id_fkey" FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL;
ALTER TABLE public."fluxo_caixa" ADD CONSTRAINT "fluxo_caixa_tratamento_id_fkey" FOREIGN KEY (tratamento_id) REFERENCES tratamentos(id) ON DELETE SET NULL;
ALTER TABLE public."movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_produto_id_fkey" FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE;
ALTER TABLE public."observacoes" ADD CONSTRAINT "observacoes_paciente_id_fkey" FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE;
ALTER TABLE public."prontuarios" ADD CONSTRAINT "prontuarios_paciente_id_fkey" FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE;
ALTER TABLE public."propostas" ADD CONSTRAINT "propostas_paciente_id_fkey" FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE;
ALTER TABLE public."propostas" ADD CONSTRAINT "propostas_tratamento_id_fkey" FOREIGN KEY (tratamento_id) REFERENCES tratamentos(id) ON DELETE SET NULL;
ALTER TABLE public."repasses_associados" ADD CONSTRAINT "repasses_associados_associado_id_fkey" FOREIGN KEY (associado_id) REFERENCES associados(id) ON DELETE SET NULL;
ALTER TABLE public."tratamentos" ADD CONSTRAINT "tratamentos_paciente_id_fkey" FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE;
CREATE TABLE public.levvai_members (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 managed_auth boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.levvai_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.levvai_members FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.levvai_members TO authenticated;
GRANT ALL ON public.levvai_members TO service_role;
CREATE POLICY levvai_member_self ON public.levvai_members FOR SELECT TO authenticated
 USING (user_id = (SELECT auth.uid()) AND (SELECT auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true');
ALTER TABLE public."acoes_ata" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."acoes_ata" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."acoes_ata" TO authenticated;
GRANT ALL ON public."acoes_ata" TO service_role;
CREATE POLICY levvai_members_only ON public."acoes_ata" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."agendamentos" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."agendamentos" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."agendamentos" TO authenticated;
GRANT ALL ON public."agendamentos" TO service_role;
CREATE POLICY levvai_members_only ON public."agendamentos" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."associados" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."associados" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."associados" TO authenticated;
GRANT ALL ON public."associados" TO service_role;
CREATE POLICY levvai_members_only ON public."associados" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."atas" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."atas" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."atas" TO authenticated;
GRANT ALL ON public."atas" TO service_role;
CREATE POLICY levvai_members_only ON public."atas" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."avaliacoes_equipe" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."avaliacoes_equipe" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."avaliacoes_equipe" TO authenticated;
GRANT ALL ON public."avaliacoes_equipe" TO service_role;
CREATE POLICY levvai_members_only ON public."avaliacoes_equipe" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."contratos" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."contratos" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."contratos" TO authenticated;
GRANT ALL ON public."contratos" TO service_role;
CREATE POLICY levvai_members_only ON public."contratos" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."editorial_calendario" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."editorial_calendario" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."editorial_calendario" TO authenticated;
GRANT ALL ON public."editorial_calendario" TO service_role;
CREATE POLICY levvai_members_only ON public."editorial_calendario" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."feedbacks_nps" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."feedbacks_nps" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."feedbacks_nps" TO authenticated;
GRANT ALL ON public."feedbacks_nps" TO service_role;
CREATE POLICY levvai_members_only ON public."feedbacks_nps" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."fluxo_caixa" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."fluxo_caixa" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."fluxo_caixa" TO authenticated;
GRANT ALL ON public."fluxo_caixa" TO service_role;
CREATE POLICY levvai_members_only ON public."fluxo_caixa" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."fornecedores" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."fornecedores" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."fornecedores" TO authenticated;
GRANT ALL ON public."fornecedores" TO service_role;
CREATE POLICY levvai_members_only ON public."fornecedores" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."movimentacoes_estoque" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."movimentacoes_estoque" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."movimentacoes_estoque" TO authenticated;
GRANT ALL ON public."movimentacoes_estoque" TO service_role;
CREATE POLICY levvai_members_only ON public."movimentacoes_estoque" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."observacoes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."observacoes" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."observacoes" TO authenticated;
GRANT ALL ON public."observacoes" TO service_role;
CREATE POLICY levvai_members_only ON public."observacoes" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."pacientes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."pacientes" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."pacientes" TO authenticated;
GRANT ALL ON public."pacientes" TO service_role;
CREATE POLICY levvai_members_only ON public."pacientes" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."produtos" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."produtos" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."produtos" TO authenticated;
GRANT ALL ON public."produtos" TO service_role;
CREATE POLICY levvai_members_only ON public."produtos" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."profissionais" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."profissionais" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."profissionais" TO authenticated;
GRANT ALL ON public."profissionais" TO service_role;
CREATE POLICY levvai_members_only ON public."profissionais" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."prontuarios" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."prontuarios" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."prontuarios" TO authenticated;
GRANT ALL ON public."prontuarios" TO service_role;
CREATE POLICY levvai_members_only ON public."prontuarios" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."propostas" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."propostas" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."propostas" TO authenticated;
GRANT ALL ON public."propostas" TO service_role;
CREATE POLICY levvai_members_only ON public."propostas" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."quotes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."quotes" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."quotes" TO authenticated;
GRANT ALL ON public."quotes" TO service_role;
CREATE POLICY levvai_members_only ON public."quotes" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."repasses_associados" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."repasses_associados" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."repasses_associados" TO authenticated;
GRANT ALL ON public."repasses_associados" TO service_role;
CREATE POLICY levvai_members_only ON public."repasses_associados" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."sessoes_oneone" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."sessoes_oneone" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."sessoes_oneone" TO authenticated;
GRANT ALL ON public."sessoes_oneone" TO service_role;
CREATE POLICY levvai_members_only ON public."sessoes_oneone" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
ALTER TABLE public."tratamentos" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."tratamentos" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."tratamentos" TO authenticated;
GRANT ALL ON public."tratamentos" TO service_role;
CREATE POLICY levvai_members_only ON public."tratamentos" FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.levvai_members WHERE user_id = (SELECT auth.uid())));
CREATE FUNCTION public.criar_receita_do_tratamento()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Só cria se tem valor e se não é uma atualização sem mudança de valor
  IF (TG_OP = 'INSERT' OR OLD.valor IS DISTINCT FROM NEW.valor) THEN
    IF NEW.valor IS NOT NULL AND NEW.valor > 0 THEN

      -- Remove entrada anterior se for UPDATE
      IF TG_OP = 'UPDATE' THEN
        DELETE FROM fluxo_caixa WHERE tratamento_id = NEW.id AND origem = 'crm';
      END IF;

      -- Busca nome do paciente
      INSERT INTO fluxo_caixa (
        tipo,
        categoria,
        valor,
        forma_pagamento,
        data,
        data_vencimento,
        status,
        paciente_id,
        paciente_nome,
        tratamento_id,
        procedimento,
        origem
      )
      SELECT
        'receita',
        'Procedimento',
        NEW.valor,
        CASE NEW.forma_pagamento
          WHEN 'Crédito' THEN 'credito'
          WHEN 'Débito' THEN 'debito'
          WHEN 'PIX' THEN 'pix'
          WHEN 'Dinheiro' THEN 'dinheiro'
          WHEN 'Cortesia' THEN 'cortesia'
          ELSE 'outro'
        END,
        COALESCE(NEW.data::DATE, CURRENT_DATE),
        NEW.data_pagamento::DATE,
        CASE NEW.status_pagamento
          WHEN 'Pago' THEN 'pago'
          WHEN 'Pendente' THEN 'em_aberto'
          ELSE 'em_aberto'
        END,
        NEW.paciente_id,
        p.nome,
        NEW.id,
        NEW.procedimento,
        'crm'
      FROM pacientes p WHERE p.id = NEW.paciente_id;

    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$function$
;
CREATE FUNCTION public.gerar_despesas_recorrentes(ano integer, mes integer)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
  despesa RECORD;
  contador INTEGER := 0;
  data_venc DATE;
BEGIN
  FOR despesa IN
    SELECT * FROM fluxo_caixa
    WHERE recorrente = true
      AND tipo = 'despesa'
      AND recorrencia_origem_id IS NULL -- só as originais, não as geradas
  LOOP
    -- Calcula data de vencimento no mês alvo
    data_venc := make_date(ano, mes, LEAST(despesa.dia_vencimento, 
      EXTRACT(DAY FROM (make_date(ano, mes, 1) + INTERVAL '1 month - 1 day'))::INT
    ));

    -- Só insere se ainda não existe para este mês
    IF NOT EXISTS (
      SELECT 1 FROM fluxo_caixa
      WHERE recorrencia_origem_id = despesa.id
        AND EXTRACT(YEAR FROM data_vencimento) = ano
        AND EXTRACT(MONTH FROM data_vencimento) = mes
    ) THEN
      INSERT INTO fluxo_caixa (
        tipo, categoria, valor, fornecedor, descricao,
        data, data_vencimento, status,
        recorrente, dia_vencimento, recorrencia_origem_id, origem
      ) VALUES (
        despesa.tipo, despesa.categoria, despesa.valor,
        despesa.fornecedor, despesa.descricao,
        data_venc, data_venc, 'em_aberto',
        false, despesa.dia_vencimento, despesa.id, 'recorrencia'
      );
      contador := contador + 1;
    END IF;
  END LOOP;

  RETURN contador;
END;
$function$
;
CREATE FUNCTION public.registrar_parcelas(p_fornecedor text, p_descricao text, p_categoria text, p_valor_total numeric, p_num_parcelas integer, p_data_primeira date)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
  valor_parcela NUMERIC;
  i INTEGER;
  data_parcela DATE;
BEGIN
  valor_parcela := ROUND(p_valor_total / p_num_parcelas, 2);

  FOR i IN 1..p_num_parcelas LOOP
    data_parcela := p_data_primeira + (INTERVAL '1 month' * (i - 1));

    INSERT INTO fluxo_caixa (
      tipo, categoria, fornecedor, descricao,
      valor, data, data_vencimento, status, origem, recorrente
    ) VALUES (
      'despesa',
      p_categoria,
      p_fornecedor,
      p_descricao || ' (' || i || '/' || p_num_parcelas || ')',
      valor_parcela,
      data_parcela,
      data_parcela,
      'em_aberto',
      'manual',
      false
    );
  END LOOP;

  RETURN p_num_parcelas;
END;
$function$
;
REVOKE ALL ON FUNCTION public.criar_receita_do_tratamento() FROM PUBLIC, anon; GRANT EXECUTE ON FUNCTION public.criar_receita_do_tratamento() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.update_updated_at() FROM PUBLIC, anon; GRANT EXECUTE ON FUNCTION public.update_updated_at() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.gerar_despesas_recorrentes(integer,integer) FROM PUBLIC, anon; GRANT EXECUTE ON FUNCTION public.gerar_despesas_recorrentes(integer,integer) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.registrar_parcelas(text,text,text,numeric,integer,date) FROM PUBLIC, anon; GRANT EXECUTE ON FUNCTION public.registrar_parcelas(text,text,text,numeric,integer,date) TO authenticated, service_role;
CREATE TRIGGER trg_associados_updated BEFORE UPDATE ON public.associados FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_repasses_updated BEFORE UPDATE ON public.repasses_associados FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contratos_updated BEFORE UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_atas_updated BEFORE UPDATE ON public.atas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_acoes_updated BEFORE UPDATE ON public.acoes_ata FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fornecedores_updated BEFORE UPDATE ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profissionais_updated BEFORE UPDATE ON public.profissionais FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_editorial_updated BEFORE UPDATE ON public.editorial_calendario FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_avaliacoes_updated BEFORE UPDATE ON public.avaliacoes_equipe FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_oneone_updated BEFORE UPDATE ON public.sessoes_oneone FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fluxo_caixa_updated BEFORE UPDATE ON public.fluxo_caixa FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_receita_automatica AFTER INSERT OR UPDATE ON public.tratamentos FOR EACH ROW EXECUTE FUNCTION criar_receita_do_tratamento();
COMMIT;
