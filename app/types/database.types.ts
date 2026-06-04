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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      challenges: {
        Row: {
          active: boolean
          created_at: string
          criteria: string[]
          description: string | null
          id: string
          kind: string
          metric: Json | null
          scoring_rules: Json
          tier: string
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          criteria?: string[]
          description?: string | null
          id?: string
          kind: string
          metric?: Json | null
          scoring_rules?: Json
          tier: string
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          criteria?: string[]
          description?: string | null
          id?: string
          kind?: string
          metric?: Json | null
          scoring_rules?: Json
          tier?: string
          title?: string
        }
        Relationships: []
      }
      manual_awards: {
        Row: {
          achieved: boolean
          awarded_by: string | null
          challenge_id: string
          created_at: string
          id: string
          matchday_id: string
          note: string | null
          player_id: string
        }
        Insert: {
          achieved?: boolean
          awarded_by?: string | null
          challenge_id: string
          created_at?: string
          id?: string
          matchday_id: string
          note?: string | null
          player_id: string
        }
        Update: {
          achieved?: boolean
          awarded_by?: string | null
          challenge_id?: string
          created_at?: string
          id?: string
          matchday_id?: string
          note?: string | null
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_awards_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_awards_matchday_id_fkey"
            columns: ["matchday_id"]
            isOneToOne: false
            referencedRelation: "matchdays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_awards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matchdays: {
        Row: {
          challenge_id: string | null
          created_at: string
          ends_at: string | null
          id: string
          label: string
          number: number
          starts_at: string | null
          status: string
          type: string
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          label: string
          number: number
          starts_at?: string | null
          status?: string
          type: string
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          label?: string
          number?: number
          starts_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "matchdays_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          external_id: number | null
          home_score: number | null
          home_team_id: string | null
          id: string
          kickoff_at: string | null
          matchday_id: string
          status: string
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          external_id?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          kickoff_at?: string | null
          matchday_id: string
          status?: string
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          external_id?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          kickoff_at?: string | null
          matchday_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_matchday_id_fkey"
            columns: ["matchday_id"]
            isOneToOne: false
            referencedRelation: "matchdays"
            referencedColumns: ["id"]
          },
        ]
      }
      player_match_stats: {
        Row: {
          assists: number
          clean_sheet: boolean
          goals: number
          id: string
          match_id: string
          minutes: number
          player_id: string
          raw: Json | null
          red: number
          yellow: number
        }
        Insert: {
          assists?: number
          clean_sheet?: boolean
          goals?: number
          id?: string
          match_id: string
          minutes?: number
          player_id: string
          raw?: Json | null
          red?: number
          yellow?: number
        }
        Update: {
          assists?: number
          clean_sheet?: boolean
          goals?: number
          id?: string
          match_id?: string
          minutes?: number
          player_id?: string
          raw?: Json | null
          red?: number
          yellow?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_match_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_points: {
        Row: {
          matchday_id: string
          player_id: string
          points: number
          user_id: string
        }
        Insert: {
          matchday_id: string
          player_id: string
          points?: number
          user_id: string
        }
        Update: {
          matchday_id?: string
          player_id?: string
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_points_matchday_id_fkey"
            columns: ["matchday_id"]
            isOneToOne: false
            referencedRelation: "matchdays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_points_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          external_id: number | null
          id: string
          name: string
          photo_url: string | null
          position: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string
          external_id?: number | null
          id?: string
          name: string
          photo_url?: string | null
          position?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string
          external_id?: number | null
          id?: string
          name?: string
          photo_url?: string | null
          position?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          last_seen_matchday: number
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          last_seen_matchday?: number
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          last_seen_matchday?: number
          username?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          computed_at: string
          matchday_id: string
          points: number
          user_id: string
        }
        Insert: {
          computed_at?: string
          matchday_id: string
          points?: number
          user_id: string
        }
        Update: {
          computed_at?: string
          matchday_id?: string
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_matchday_id_fkey"
            columns: ["matchday_id"]
            isOneToOne: false
            referencedRelation: "matchdays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      selection_players: {
        Row: {
          player_id: string
          selection_id: string
        }
        Insert: {
          player_id: string
          selection_id: string
        }
        Update: {
          player_id?: string
          selection_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "selection_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "selection_players_selection_id_fkey"
            columns: ["selection_id"]
            isOneToOne: false
            referencedRelation: "selections"
            referencedColumns: ["id"]
          },
        ]
      }
      selections: {
        Row: {
          auto_filled: boolean
          created_at: string
          id: string
          locked_at: string | null
          matchday_id: string
          user_id: string
        }
        Insert: {
          auto_filled?: boolean
          created_at?: string
          id?: string
          locked_at?: string | null
          matchday_id: string
          user_id: string
        }
        Update: {
          auto_filled?: boolean
          created_at?: string
          id?: string
          locked_at?: string | null
          matchday_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "selections_matchday_id_fkey"
            columns: ["matchday_id"]
            isOneToOne: false
            referencedRelation: "matchdays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "selections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          code: string | null
          created_at: string
          external_id: number | null
          flag_code: string | null
          group_label: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          external_id?: number | null
          flag_code?: string | null
          group_label?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          external_id?: number | null
          flag_code?: string | null
          group_label?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          total_points: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
