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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          available_capital: number | null
          avatar_url: string | null
          best_trade: number | null
          country: string | null
          created_at: string | null
          email: string
          id: string
          institution: string | null
          name: string
          student_verification_status: string | null
          student_verified: boolean | null
          subscription_plan: string | null
          tier: string
          total_capital: number | null
          total_pnl: number | null
          total_trades: number | null
          updated_at: string | null
          user_id: string
          waec_number: string | null
          win_rate: number | null
          worst_trade: number | null
        }
        Insert: {
          available_capital?: number | null
          avatar_url?: string | null
          best_trade?: number | null
          country?: string | null
          created_at?: string | null
          email: string
          id?: string
          institution?: string | null
          name: string
          student_verification_status?: string | null
          student_verified?: boolean | null
          subscription_plan?: string | null
          tier?: string
          total_capital?: number | null
          total_pnl?: number | null
          total_trades?: number | null
          updated_at?: string | null
          user_id: string
          waec_number?: string | null
          win_rate?: number | null
          worst_trade?: number | null
        }
        Update: {
          available_capital?: number | null
          avatar_url?: string | null
          best_trade?: number | null
          country?: string | null
          created_at?: string | null
          email?: string
          id?: string
          institution?: string | null
          name?: string
          student_verification_status?: string | null
          student_verified?: boolean | null
          subscription_plan?: string | null
          tier?: string
          total_capital?: number | null
          total_pnl?: number | null
          total_trades?: number | null
          updated_at?: string | null
          user_id?: string
          waec_number?: string | null
          win_rate?: number | null
          worst_trade?: number | null
        }
        Relationships: []
      }
      student_verifications: {
        Row: {
          admission_letter_url: string | null
          city: string | null
          country: string | null
          created_at: string
          current_step: number
          date_of_birth: string | null
          declaration_agreed: boolean | null
          enrollment_year: number | null
          expected_graduation: number | null
          full_name: string | null
          id: string
          institution_name: string | null
          institution_type: string | null
          nin_number: string | null
          nin_slip_url: string | null
          phone_number: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          state_province: string | null
          status: string
          student_id: string | null
          student_id_url: string | null
          terms_agreed: boolean | null
          updated_at: string
          user_id: string
          waec_center: string | null
          waec_exam_number: string | null
          waec_result_url: string | null
          waec_year: number | null
        }
        Insert: {
          admission_letter_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_step?: number
          date_of_birth?: string | null
          declaration_agreed?: boolean | null
          enrollment_year?: number | null
          expected_graduation?: number | null
          full_name?: string | null
          id?: string
          institution_name?: string | null
          institution_type?: string | null
          nin_number?: string | null
          nin_slip_url?: string | null
          phone_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          state_province?: string | null
          status?: string
          student_id?: string | null
          student_id_url?: string | null
          terms_agreed?: boolean | null
          updated_at?: string
          user_id: string
          waec_center?: string | null
          waec_exam_number?: string | null
          waec_result_url?: string | null
          waec_year?: number | null
        }
        Update: {
          admission_letter_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_step?: number
          date_of_birth?: string | null
          declaration_agreed?: boolean | null
          enrollment_year?: number | null
          expected_graduation?: number | null
          full_name?: string | null
          id?: string
          institution_name?: string | null
          institution_type?: string | null
          nin_number?: string | null
          nin_slip_url?: string | null
          phone_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          state_province?: string | null
          status?: string
          student_id?: string | null
          student_id_url?: string | null
          terms_agreed?: boolean | null
          updated_at?: string
          user_id?: string
          waec_center?: string | null
          waec_exam_number?: string | null
          waec_result_url?: string | null
          waec_year?: number | null
        }
        Relationships: []
      }
      trade_history: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          amount: number
          created_at: string | null
          id: string
          market: string
          pnl: number | null
          price: number
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          amount: number
          created_at?: string | null
          id?: string
          market: string
          pnl?: number | null
          price: number
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          market?: string
          pnl?: number | null
          price?: number
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          alert_on_loss: number | null
          alert_on_profit: number | null
          api_rate_limit: number | null
          auto_execute: boolean | null
          compact_mode: boolean | null
          confidence_threshold: number | null
          confirm_trades: boolean | null
          created_at: string | null
          data_refresh_rate: number | null
          debug_mode: boolean | null
          default_model: string | null
          default_timeframe: string | null
          email_alerts: boolean | null
          foresight_opacity: number | null
          glow_intensity: number | null
          id: string
          kill_switch_enabled: boolean | null
          kill_switch_threshold: number | null
          max_agents: number | null
          max_balance_per_agent: number | null
          max_daily_loss: number | null
          max_drawdown: number | null
          push_notifications: boolean | null
          risk_preset: string | null
          session_timeout: number | null
          show_pnl_in_header: boolean | null
          sound_enabled: boolean | null
          stop_loss_percent: number | null
          take_profit_percent: number | null
          theme: string | null
          trading_mode: string | null
          updated_at: string | null
          user_id: string
          volatility_tolerance: number | null
        }
        Insert: {
          alert_on_loss?: number | null
          alert_on_profit?: number | null
          api_rate_limit?: number | null
          auto_execute?: boolean | null
          compact_mode?: boolean | null
          confidence_threshold?: number | null
          confirm_trades?: boolean | null
          created_at?: string | null
          data_refresh_rate?: number | null
          debug_mode?: boolean | null
          default_model?: string | null
          default_timeframe?: string | null
          email_alerts?: boolean | null
          foresight_opacity?: number | null
          glow_intensity?: number | null
          id?: string
          kill_switch_enabled?: boolean | null
          kill_switch_threshold?: number | null
          max_agents?: number | null
          max_balance_per_agent?: number | null
          max_daily_loss?: number | null
          max_drawdown?: number | null
          push_notifications?: boolean | null
          risk_preset?: string | null
          session_timeout?: number | null
          show_pnl_in_header?: boolean | null
          sound_enabled?: boolean | null
          stop_loss_percent?: number | null
          take_profit_percent?: number | null
          theme?: string | null
          trading_mode?: string | null
          updated_at?: string | null
          user_id: string
          volatility_tolerance?: number | null
        }
        Update: {
          alert_on_loss?: number | null
          alert_on_profit?: number | null
          api_rate_limit?: number | null
          auto_execute?: boolean | null
          compact_mode?: boolean | null
          confidence_threshold?: number | null
          confirm_trades?: boolean | null
          created_at?: string | null
          data_refresh_rate?: number | null
          debug_mode?: boolean | null
          default_model?: string | null
          default_timeframe?: string | null
          email_alerts?: boolean | null
          foresight_opacity?: number | null
          glow_intensity?: number | null
          id?: string
          kill_switch_enabled?: boolean | null
          kill_switch_threshold?: number | null
          max_agents?: number | null
          max_balance_per_agent?: number | null
          max_daily_loss?: number | null
          max_drawdown?: number | null
          push_notifications?: boolean | null
          risk_preset?: string | null
          session_timeout?: number | null
          show_pnl_in_header?: boolean | null
          sound_enabled?: boolean | null
          stop_loss_percent?: number | null
          take_profit_percent?: number | null
          theme?: string | null
          trading_mode?: string | null
          updated_at?: string | null
          user_id?: string
          volatility_tolerance?: number | null
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          created_at: string | null
          id: string
          symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          symbol: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
