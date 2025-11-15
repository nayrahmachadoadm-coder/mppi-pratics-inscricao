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
      avaliacoes: {
        Row: {
          alinhamento_ods: number
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
          alinhamento_ods: number
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
          alinhamento_ods?: number
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
        ]
      }
      inscricoes: {
        Row: {
          alinhamento_ods: string
          ano_inicio_execucao: string | null
          area: string | null
          area_atuacao: string
          cargo_funcao: string
          concorda_termos: boolean | null
          cooperacao: string
          created_at: string
          data_conclusao: string | null
          data_fim: string | null
          data_inicio: string
          declaracao: boolean | null
          descricao_iniciativa: string
          email_institucional: string
          equipe_envolvida: string | null
          especificar_edicoes_anteriores: string | null
          etapas_metodologia: string | null
          foi_vencedor_anterior: boolean | null
          id: string
          impacto_social: string
          inovacao: string
          local_data: string | null
          lotacao: string
          matricula: string | null
          metodologia: string
          nome_completo: string
          objetivos: string
          objetivos_estrategicos: string | null
          observacoes: string | null
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
          telefone: string
          telefone_institucional: string | null
          titulo_iniciativa: string
          unidade_setor: string | null
          updated_at: string
        }
        Insert: {
          alinhamento_ods: string
          ano_inicio_execucao?: string | null
          area?: string | null
          area_atuacao: string
          cargo_funcao: string
          concorda_termos?: boolean | null
          cooperacao: string
          created_at?: string
          data_conclusao?: string | null
          data_fim?: string | null
          data_inicio: string
          declaracao?: boolean | null
          descricao_iniciativa: string
          email_institucional: string
          equipe_envolvida?: string | null
          especificar_edicoes_anteriores?: string | null
          etapas_metodologia?: string | null
          foi_vencedor_anterior?: boolean | null
          id?: string
          impacto_social: string
          inovacao: string
          local_data?: string | null
          lotacao: string
          matricula?: string | null
          metodologia: string
          nome_completo: string
          objetivos: string
          objetivos_estrategicos?: string | null
          observacoes?: string | null
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
          telefone: string
          telefone_institucional?: string | null
          titulo_iniciativa: string
          unidade_setor?: string | null
          updated_at?: string
        }
        Update: {
          alinhamento_ods?: string
          ano_inicio_execucao?: string | null
          area?: string | null
          area_atuacao?: string
          cargo_funcao?: string
          concorda_termos?: boolean | null
          cooperacao?: string
          created_at?: string
          data_conclusao?: string | null
          data_fim?: string | null
          data_inicio?: string
          declaracao?: boolean | null
          descricao_iniciativa?: string
          email_institucional?: string
          equipe_envolvida?: string | null
          especificar_edicoes_anteriores?: string | null
          etapas_metodologia?: string | null
          foi_vencedor_anterior?: boolean | null
          id?: string
          impacto_social?: string
          inovacao?: string
          local_data?: string | null
          lotacao?: string
          matricula?: string | null
          metodologia?: string
          nome_completo?: string
          objetivos?: string
          objetivos_estrategicos?: string | null
          observacoes?: string | null
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
          telefone?: string
          telefone_institucional?: string | null
          titulo_iniciativa?: string
          unidade_setor?: string | null
          updated_at?: string
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
      votos_populares: {
        Row: {
          categoria: string
          created_at: string
          email: string | null
          fingerprint: string
          id: string
          inscricao_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          email?: string | null
          fingerprint: string
          id?: string
          inscricao_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          email?: string | null
          fingerprint?: string
          id?: string
          inscricao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votos_populares_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "inscricoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      rpc_inscricao_by_id: {
        Args: { _id: string }
        Returns: {
          alinhamento_ods: string
          ano_inicio_execucao: string | null
          area: string | null
          area_atuacao: string
          cargo_funcao: string
          concorda_termos: boolean | null
          cooperacao: string
          created_at: string
          data_conclusao: string | null
          data_fim: string | null
          data_inicio: string
          declaracao: boolean | null
          descricao_iniciativa: string
          email_institucional: string
          equipe_envolvida: string | null
          especificar_edicoes_anteriores: string | null
          etapas_metodologia: string | null
          foi_vencedor_anterior: boolean | null
          id: string
          impacto_social: string
          inovacao: string
          local_data: string | null
          lotacao: string
          matricula: string | null
          metodologia: string
          nome_completo: string
          objetivos: string
          objetivos_estrategicos: string | null
          observacoes: string | null
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
          telefone: string
          telefone_institucional: string | null
          titulo_iniciativa: string
          unidade_setor: string | null
          updated_at: string
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
          cargo_funcao: string
          concorda_termos: boolean | null
          cooperacao: string
          created_at: string
          data_conclusao: string | null
          data_fim: string | null
          data_inicio: string
          declaracao: boolean | null
          descricao_iniciativa: string
          email_institucional: string
          equipe_envolvida: string | null
          especificar_edicoes_anteriores: string | null
          etapas_metodologia: string | null
          foi_vencedor_anterior: boolean | null
          id: string
          impacto_social: string
          inovacao: string
          local_data: string | null
          lotacao: string
          matricula: string | null
          metodologia: string
          nome_completo: string
          objetivos: string
          objetivos_estrategicos: string | null
          observacoes: string | null
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
          telefone: string
          telefone_institucional: string | null
          titulo_iniciativa: string
          unidade_setor: string | null
          updated_at: string
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
      unaccent: { Args: { "": string }; Returns: string }
      update_profile_password_flag: {
        Args: { _must_change: boolean; _profile_id: string }
        Returns: undefined
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
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
