export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      apuracao_execucoes: {
        Row: {
          data_execucao: string
          executor: string
          hash_insumos: string | null
          id: string
        }
        Insert: {
          data_execucao?: string
          executor: string
          hash_insumos?: string | null
          id?: string
        }
        Update: {
          data_execucao?: string
          executor?: string
          hash_insumos?: string | null
          id?: string
        }
        Relationships: []
      }
      apuracao_resultados: {
        Row: {
          categoria: string
          classificacao_final: number | null
          criterio_desempate: string | null
          execucao_id: string | null
          id: string
          inscricao_id: string | null
          is_finalista: boolean
          maior_voto_categoria: number
          nota_popular: number | null
          nota_tecnica: number
          pontuacao_final: number | null
          votos_validos: number
        }
        Insert: {
          categoria: string
          classificacao_final?: number | null
          criterio_desempate?: string | null
          execucao_id?: string | null
          id?: string
          inscricao_id?: string | null
          is_finalista?: boolean
          maior_voto_categoria?: number
          nota_popular?: number | null
          nota_tecnica: number
          pontuacao_final?: number | null
          votos_validos?: number
        }
        Update: {
          categoria?: string
          classificacao_final?: number | null
          criterio_desempate?: string | null
          execucao_id?: string | null
          id?: string
          inscricao_id?: string | null
          is_finalista?: boolean
          maior_voto_categoria?: number
          nota_popular?: number | null
          nota_tecnica?: number
          pontuacao_final?: number | null
          votos_validos?: number
        }
        Relationships: [
          {
            foreignKeyName: "apuracao_resultados_execucao_id_fkey"
            columns: ["execucao_id"]
            isOneToOne: false
            referencedRelation: "apuracao_execucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apuracao_resultados_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "inscricoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apuracao_resultados_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "triagem_duplicidades"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          alinhamento_ods: number | null
          cooperacao: number
          created_at: string
          id: string
          impacto_social: number
          inovacao: number
          inscricao_id: string
          jurado_username: string
          replicabilidade: number
          resolutividade: number
          total: number
          updated_at: string
        }
        Insert: {
          alinhamento_ods?: number | null
          cooperacao: number
          created_at?: string
          id?: string
          impacto_social: number
          inovacao: number
          inscricao_id: string
          jurado_username: string
          replicabilidade: number
          resolutividade: number
          total: number
          updated_at?: string
        }
        Update: {
          alinhamento_ods?: number | null
          cooperacao?: number
          created_at?: string
          id?: string
          impacto_social?: number
          inovacao?: number
          inscricao_id?: string
          jurado_username?: string
          replicabilidade?: number
          resolutividade?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "inscricoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "triagem_duplicidades"
            referencedColumns: ["id"]
          },
        ]
      }
      categoria_parametros: {
        Row: {
          divisor: number
          tipo_iniciativa: string
        }
        Insert: {
          divisor: number
          tipo_iniciativa: string
        }
        Update: {
          divisor?: number
          tipo_iniciativa?: string
        }
        Relationships: []
      }
      cronograma_parametros: {
        Row: {
          chave: string
          descricao: string | null
          valor_data: string | null
        }
        Insert: {
          chave: string
          descricao?: string | null
          valor_data?: string | null
        }
        Update: {
          chave?: string
          descricao?: string | null
          valor_data?: string | null
        }
        Relationships: []
      }
      finalistas_execucoes: {
        Row: {
          data_execucao: string
          executor: string
          id: string
          ignorar_pendencias: boolean | null
          julgadores_considerados: number
          justificativa: string | null
        }
        Insert: {
          data_execucao?: string
          executor: string
          id?: string
          ignorar_pendencias?: boolean | null
          julgadores_considerados: number
          justificativa?: string | null
        }
        Update: {
          data_execucao?: string
          executor?: string
          id?: string
          ignorar_pendencias?: boolean | null
          julgadores_considerados?: number
          justificativa?: string | null
        }
        Relationships: []
      }
      finalistas_snapshot: {
        Row: {
          categoria: string
          created_at: string
          divisor: number
          id: string
          inscricao_id: string | null
          julgadores_count: number
          media_cooperacao: number | null
          media_impacto: number | null
          media_inovacao: number | null
          media_replicabilidade: number | null
          media_resolutividade: number | null
          nota_tecnica_calculada: number
          posicao_tecnica: number
          publicado_por: string
        }
        Insert: {
          categoria: string
          created_at?: string
          divisor: number
          id?: string
          inscricao_id?: string | null
          julgadores_count: number
          media_cooperacao?: number | null
          media_impacto?: number | null
          media_inovacao?: number | null
          media_replicabilidade?: number | null
          media_resolutividade?: number | null
          nota_tecnica_calculada: number
          posicao_tecnica: number
          publicado_por: string
        }
        Update: {
          categoria?: string
          created_at?: string
          divisor?: number
          id?: string
          inscricao_id?: string | null
          julgadores_count?: number
          media_cooperacao?: number | null
          media_impacto?: number | null
          media_inovacao?: number | null
          media_replicabilidade?: number | null
          media_resolutividade?: number | null
          nota_tecnica_calculada?: number
          posicao_tecnica?: number
          publicado_por?: string
        }
        Relationships: [
          {
            foreignKeyName: "finalistas_snapshot_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "inscricoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finalistas_snapshot_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "triagem_duplicidades"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricao_status_historico: {
        Row: {
          autor: string
          created_at: string
          id: string
          inscricao_id: string | null
          motivo: string | null
          numero_sei: string | null
          status_anterior: string | null
          status_novo: string
        }
        Insert: {
          autor: string
          created_at?: string
          id?: string
          inscricao_id?: string | null
          motivo?: string | null
          numero_sei?: string | null
          status_anterior?: string | null
          status_novo: string
        }
        Update: {
          autor?: string
          created_at?: string
          id?: string
          inscricao_id?: string | null
          motivo?: string | null
          numero_sei?: string | null
          status_anterior?: string | null
          status_novo?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscricao_status_historico_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "inscricoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricao_status_historico_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "triagem_duplicidades"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricoes: {
        Row: {
          alinhamento_ods: string
          ano_inicio_execucao: string | null
          area: string | null
          area_atuacao: string
          cadastro_banco_praticas: boolean | null
          cargo_funcao: string
          concorda_termos: boolean | null
          cooperacao: string
          created_at: string
          data_conclusao: string | null
          data_fim: string | null
          data_inicio: string
          declaracao: boolean | null
          descricao_iniciativa: string
          edicao_ano: number | null
          email_institucional: string
          equipe_envolvida: string | null
          especificar_edicoes_anteriores: string | null
          etapas_metodologia: string | null
          foi_vencedor_anterior: boolean | null
          id: string
          identificacao_banco_praticas: string | null
          identificacao_projeto_metodologia: string | null
          impacto_social: string
          inovacao: string
          institucionalizado_ato: boolean | null
          local_data: string | null
          lotacao: string
          matricula: string | null
          metodologia: string
          nome_completo: string
          objetivos: string
          objetivos_estrategicos: string | null
          observacoes: string | null
          parecer_triagem: string | null
          participou_edicoes_anteriores: boolean | null
          principais_resultados: string
          problema_necessidade: string | null
          publico_alvo: string
          replicabilidade: string
          resolutividade: string
          resultados_alcancados: string | null
          resumo_executivo: string | null
          situacao_atual: string | null
          status: string | null
          status_inscricao: string | null
          telefone: string
          telefone_institucional: string | null
          tipo_iniciativa: string | null
          titulo_iniciativa: string
          unidade_setor: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alinhamento_ods: string
          ano_inicio_execucao?: string | null
          area?: string | null
          area_atuacao: string
          cadastro_banco_praticas?: boolean | null
          cargo_funcao: string
          concorda_termos?: boolean | null
          cooperacao: string
          created_at?: string
          data_conclusao?: string | null
          data_fim?: string | null
          data_inicio: string
          declaracao?: boolean | null
          descricao_iniciativa: string
          edicao_ano?: number | null
          email_institucional: string
          equipe_envolvida?: string | null
          especificar_edicoes_anteriores?: string | null
          etapas_metodologia?: string | null
          foi_vencedor_anterior?: boolean | null
          id?: string
          identificacao_banco_praticas?: string | null
          identificacao_projeto_metodologia?: string | null
          impacto_social: string
          inovacao: string
          institucionalizado_ato?: boolean | null
          local_data?: string | null
          lotacao: string
          matricula?: string | null
          metodologia: string
          nome_completo: string
          objetivos: string
          objetivos_estrategicos?: string | null
          observacoes?: string | null
          parecer_triagem?: string | null
          participou_edicoes_anteriores?: boolean | null
          principais_resultados: string
          problema_necessidade?: string | null
          publico_alvo: string
          replicabilidade: string
          resolutividade: string
          resultados_alcancados?: string | null
          resumo_executivo?: string | null
          situacao_atual?: string | null
          status?: string | null
          status_inscricao?: string | null
          telefone: string
          telefone_institucional?: string | null
          tipo_iniciativa?: string | null
          titulo_iniciativa: string
          unidade_setor?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alinhamento_ods?: string
          ano_inicio_execucao?: string | null
          area?: string | null
          area_atuacao?: string
          cadastro_banco_praticas?: boolean | null
          cargo_funcao?: string
          concorda_termos?: boolean | null
          cooperacao?: string
          created_at?: string
          data_conclusao?: string | null
          data_fim?: string | null
          data_inicio?: string
          declaracao?: boolean | null
          descricao_iniciativa?: string
          edicao_ano?: number | null
          email_institucional?: string
          equipe_envolvida?: string | null
          especificar_edicoes_anteriores?: string | null
          etapas_metodologia?: string | null
          foi_vencedor_anterior?: boolean | null
          id?: string
          identificacao_banco_praticas?: string | null
          identificacao_projeto_metodologia?: string | null
          impacto_social?: string
          inovacao?: string
          institucionalizado_ato?: boolean | null
          local_data?: string | null
          lotacao?: string
          matricula?: string | null
          metodologia?: string
          nome_completo?: string
          objetivos?: string
          objetivos_estrategicos?: string | null
          observacoes?: string | null
          parecer_triagem?: string | null
          participou_edicoes_anteriores?: boolean | null
          principais_resultados?: string
          problema_necessidade?: string | null
          publico_alvo?: string
          replicabilidade?: string
          resolutividade?: string
          resultados_alcancados?: string | null
          resumo_executivo?: string | null
          situacao_atual?: string | null
          status?: string | null
          status_inscricao?: string | null
          telefone?: string
          telefone_institucional?: string | null
          tipo_iniciativa?: string | null
          titulo_iniciativa?: string
          unidade_setor?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          must_change_password: boolean | null
          seat_code: string | null
          seat_label: string | null
          updated_at: string
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          must_change_password?: boolean | null
          seat_code?: string | null
          seat_label?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          must_change_password?: boolean | null
          seat_code?: string | null
          seat_label?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votacao_finalizada: {
        Row: {
          categoria: string
          finalized_at: string
          id: string
          jurado_username: string
        }
        Insert: {
          categoria: string
          finalized_at?: string
          id?: string
          jurado_username: string
        }
        Update: {
          categoria?: string
          finalized_at?: string
          id?: string
          jurado_username?: string
        }
        Relationships: []
      }
      votos_populares: {
        Row: {
          categoria: string
          created_at: string
          email: string | null
          execucao_id: string | null
          fingerprint: string
          id: string
          inscricao_id: string
          ip_address: string | null
          motivo_invalidacao: string | null
          valido: boolean | null
        }
        Insert: {
          categoria: string
          created_at?: string
          email?: string | null
          execucao_id?: string | null
          fingerprint: string
          id?: string
          inscricao_id: string
          ip_address?: string | null
          motivo_invalidacao?: string | null
          valido?: boolean | null
        }
        Update: {
          categoria?: string
          created_at?: string
          email?: string | null
          execucao_id?: string | null
          fingerprint?: string
          id?: string
          inscricao_id?: string
          ip_address?: string | null
          motivo_invalidacao?: string | null
          valido?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "votos_populares_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "inscricoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votos_populares_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "triagem_duplicidades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      triagem_duplicidades: {
        Row: {
          area: string | null
          created_at: string | null
          id: string | null
          is_duplicata_posterior: boolean | null
          matricula: string | null
          ordem_envio: number | null
          status_inscricao: string | null
          tipo_iniciativa: string | null
          titulo_iniciativa: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apurar_resultados_finais: {
        Args: { p_executor: string }
        Returns: string
      }
      apurar_resultados_finais_v2: {
        Args: { p_dry_run?: boolean; p_justificativa?: string }
        Returns: Database["public"]["CompositeTypes"]["apuracao_preview"][]
        SetofOptions: {
          from: "*"
          to: "apuracao_preview"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      consolidar_finalistas: {
        Args: { p_publicado_por: string }
        Returns: boolean
      }
      consolidar_finalistas_v2:
        | {
            Args: {
              p_dry_run?: boolean
              p_ignorar_pendencias?: boolean
              p_justificativa?: string
            }
            Returns: Database["public"]["CompositeTypes"]["finalista_preview"][]
            SetofOptions: {
              from: "*"
              to: "finalista_preview"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: {
              p_dry_run?: boolean
              p_ignorar_pendencias?: boolean
              p_justificativa?: string
            }
            Returns: Database["public"]["CompositeTypes"]["finalista_preview"][]
            SetofOptions: {
              from: "*"
              to: "finalista_preview"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      current_user_has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      get_jury_evaluations_count: {
        Args: never
        Returns: {
          avaliacoes_count: number
          jurado_username: string
        }[]
      }
      get_voto_popular_candidatos: {
        Args: { p_categoria: string; p_session_seed: number }
        Returns: {
          descricao_iniciativa: string
          inscricao_id: string
          lotacao: string
          metodologia: string
          nome_completo: string
          principais_resultados: string
          problema_necessidade: string
          titulo_iniciativa: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_text: {
        Args: { _role_text: string; _user_id: string }
        Returns: boolean
      }
      register_admin: {
        Args: {
          _auth_user_id: string
          _email: string
          _full_name: string
          _username: string
        }
        Returns: string
      }
      register_jurado: {
        Args: {
          _auth_user_id: string
          _email: string
          _full_name: string
          _must_change?: boolean
          _seat_code: string
          _seat_label: string
          _username: string
        }
        Returns: string
      }
      rpc_delete_inscricao: { Args: { p_inscricao_id: string }; Returns: Json }
      rpc_inscricao_by_id: {
        Args: { _id: string }
        Returns: {
          alinhamento_ods: string
          ano_inicio_execucao: string | null
          area: string | null
          area_atuacao: string
          cadastro_banco_praticas: boolean | null
          cargo_funcao: string
          concorda_termos: boolean | null
          cooperacao: string
          created_at: string
          data_conclusao: string | null
          data_fim: string | null
          data_inicio: string
          declaracao: boolean | null
          descricao_iniciativa: string
          edicao_ano: number | null
          email_institucional: string
          equipe_envolvida: string | null
          especificar_edicoes_anteriores: string | null
          etapas_metodologia: string | null
          foi_vencedor_anterior: boolean | null
          id: string
          identificacao_banco_praticas: string | null
          identificacao_projeto_metodologia: string | null
          impacto_social: string
          inovacao: string
          institucionalizado_ato: boolean | null
          local_data: string | null
          lotacao: string
          matricula: string | null
          metodologia: string
          nome_completo: string
          objetivos: string
          objetivos_estrategicos: string | null
          observacoes: string | null
          parecer_triagem: string | null
          participou_edicoes_anteriores: boolean | null
          principais_resultados: string
          problema_necessidade: string | null
          publico_alvo: string
          replicabilidade: string
          resolutividade: string
          resultados_alcancados: string | null
          resumo_executivo: string | null
          situacao_atual: string | null
          status: string | null
          status_inscricao: string | null
          telefone: string
          telefone_institucional: string | null
          tipo_iniciativa: string | null
          titulo_iniciativa: string
          unidade_setor: string | null
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "inscricoes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      rpc_inscricoes_list_by_area: {
        Args: { area_key: string; p_limit_rows?: number; p_offset?: number }
        Returns: {
          alinhamento_ods: string
          ano_inicio_execucao: string | null
          area: string | null
          area_atuacao: string
          cadastro_banco_praticas: boolean | null
          cargo_funcao: string
          concorda_termos: boolean | null
          cooperacao: string
          created_at: string
          data_conclusao: string | null
          data_fim: string | null
          data_inicio: string
          declaracao: boolean | null
          descricao_iniciativa: string
          edicao_ano: number | null
          email_institucional: string
          equipe_envolvida: string | null
          especificar_edicoes_anteriores: string | null
          etapas_metodologia: string | null
          foi_vencedor_anterior: boolean | null
          id: string
          identificacao_banco_praticas: string | null
          identificacao_projeto_metodologia: string | null
          impacto_social: string
          inovacao: string
          institucionalizado_ato: boolean | null
          local_data: string | null
          lotacao: string
          matricula: string | null
          metodologia: string
          nome_completo: string
          objetivos: string
          objetivos_estrategicos: string | null
          observacoes: string | null
          parecer_triagem: string | null
          participou_edicoes_anteriores: boolean | null
          principais_resultados: string
          problema_necessidade: string | null
          publico_alvo: string
          replicabilidade: string
          resolutividade: string
          resultados_alcancados: string | null
          resumo_executivo: string | null
          situacao_atual: string | null
          status: string | null
          status_inscricao: string | null
          telefone: string
          telefone_institucional: string | null
          tipo_iniciativa: string | null
          titulo_iniciativa: string
          unidade_setor: string | null
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "inscricoes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      rpc_inscricoes_por_area: {
        Args: never
        Returns: {
          area: string
          count: number
        }[]
      }
      rpc_list_jurados: {
        Args: never
        Returns: {
          created_at: string
          full_name: string
          seat_code: string
          seat_label: string
          username: string
        }[]
      }
      rpc_update_status_inscricao: {
        Args: { p_inscricao_id: string; p_parecer?: string; p_status: string }
        Returns: Json
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_profile_password_flag: {
        Args: { _must_change: boolean; _profile_id: string }
        Returns: undefined
      }
      verificar_duplicidade_inscricao: {
        Args: { p_matricula: string; p_tipo_iniciativa: string }
        Returns: boolean
      }
      voto_popular_top3_por_categoria: {
        Args: { area_key: string }
        Returns: {
          alinhamento_ods: string
          area_atuacao: string
          avaliacoes_count: number
          cargo_funcao: string
          categoria: string
          cooperacao: string
          data_inicio: string
          descricao_iniciativa: string
          impacto_social: string
          inovacao: string
          inscricao_id: string
          lotacao: string
          metodologia: string
          nome_completo: string
          objetivos: string
          posicao: number
          principais_resultados: string
          problema_necessidade: string
          publico_alvo: string
          replicabilidade: string
          resolutividade: string
          titulo_iniciativa: string
          total_geral: number
          total_replicabilidade: number
          total_resolutividade: number
        }[]
      }
      votos_count: {
        Args: { categoria: string }
        Returns: {
          inscricao_id: string
          votos: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "jurado" | "user"
    }
    CompositeTypes: {
      apuracao_preview: {
        inscricao_id: string | null
        categoria: string | null
        is_finalista: boolean | null
        nota_tecnica: number | null
        votos_validos: number | null
        maior_voto_categoria: number | null
        nota_popular: number | null
        pontuacao_final: number | null
        classificacao_final: number | null
        criterio_desempate: string | null
        status_diff: string | null
      }
      finalista_preview: {
        inscricao_id: string | null
        categoria: string | null
        nota_tecnica_calculada: number | null
        posicao_tecnica: number | null
        julgadores_count: number | null
        status_diff: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "jurado", "user"],
    },
  },
} as const
