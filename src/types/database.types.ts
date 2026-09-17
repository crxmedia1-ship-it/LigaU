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
      athletes: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          jersey_number: number | null
          photo_url: string | null
          position: string | null
          team_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          jersey_number?: number | null
          photo_url?: string | null
          position?: string | null
          team_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          jersey_number?: number | null
          photo_url?: string | null
          position?: string | null
          team_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          assist_athlete_id: string | null
          athlete_id: string
          created_at: string
          detail: string | null
          event_type: string
          id: string
          match_id: string
          team_id: string
          value: number
        }
        Insert: {
          assist_athlete_id?: string | null
          athlete_id: string
          created_at?: string
          detail?: string | null
          event_type: string
          id?: string
          match_id: string
          team_id: string
          value?: number
        }
        Update: {
          assist_athlete_id?: string | null
          athlete_id?: string
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: string
          match_id?: string
          team_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_events_assist_athlete_id_fkey"
            columns: ["assist_athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string
          created_at: string
          home_score: number | null
          home_team_id: string
          id: string
          location: string | null
          match_date: string
          match_details: Json
          mvp_athlete_id: string | null
          round_name: string | null
          sport_id: string
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team_id: string
          created_at?: string
          home_score?: number | null
          home_team_id: string
          id?: string
          location?: string | null
          match_date: string
          match_details?: Json
          mvp_athlete_id?: string | null
          round_name?: string | null
          sport_id: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team_id?: string
          created_at?: string
          home_score?: number | null
          home_team_id?: string
          id?: string
          location?: string | null
          match_date?: string
          match_details?: Json
          mvp_athlete_id?: string | null
          round_name?: string | null
          sport_id?: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
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
            foreignKeyName: "matches_mvp_athlete_id_fkey"
            columns: ["mvp_athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean
          published_at: string | null
          slug: string
          sport_id: string | null
          title: string
          university_id: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          slug: string
          sport_id?: string | null
          title: string
          university_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          slug?: string
          sport_id?: string | null
          title?: string
          university_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      pass_benefits: {
        Row: {
          click_count: number
          created_at: string
          discount_title: string
          expires_at: string | null
          external_url: string | null
          id: string
          instructions: string | null
          promo_code: string | null
          redemption_type: Database["public"]["Enums"]["redemption_type"]
          sponsor_id: string
          status: Database["public"]["Enums"]["pass_status"]
          updated_at: string
        }
        Insert: {
          click_count?: number
          created_at?: string
          discount_title: string
          expires_at?: string | null
          external_url?: string | null
          id?: string
          instructions?: string | null
          promo_code?: string | null
          redemption_type: Database["public"]["Enums"]["redemption_type"]
          sponsor_id: string
          status?: Database["public"]["Enums"]["pass_status"]
          updated_at?: string
        }
        Update: {
          click_count?: number
          created_at?: string
          discount_title?: string
          expires_at?: string | null
          external_url?: string | null
          id?: string
          instructions?: string | null
          promo_code?: string | null
          redemption_type?: Database["public"]["Enums"]["redemption_type"]
          sponsor_id?: string
          status?: Database["public"]["Enums"]["pass_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pass_benefits_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "pass_sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      pass_sponsors: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          location_tag: string | null
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_tag?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_tag?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      podcast_episodes: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          episode_number: number
          id: string
          published_at: string | null
          spotify_url: string | null
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          episode_number: number
          id?: string
          published_at?: string | null
          spotify_url?: string | null
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          episode_number?: number
          id?: string
          published_at?: string | null
          spotify_url?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      sports: {
        Row: {
          category_type: Database["public"]["Enums"]["sport_category"]
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category_type: Database["public"]["Enums"]["sport_category"]
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category_type?: Database["public"]["Enums"]["sport_category"]
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          coach_name: string | null
          created_at: string
          gender: Database["public"]["Enums"]["team_gender"]
          id: string
          sport_id: string
          university_id: string
          updated_at: string
        }
        Insert: {
          coach_name?: string | null
          created_at?: string
          gender?: Database["public"]["Enums"]["team_gender"]
          id?: string
          sport_id: string
          university_id: string
          updated_at?: string
        }
        Update: {
          coach_name?: string | null
          created_at?: string
          gender?: Database["public"]["Enums"]["team_gender"]
          id?: string
          sport_id?: string
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          colors: Json
          created_at: string
          id: string
          logo_url: string | null
          name: string
          short_name: string
          updated_at: string
        }
        Insert: {
          colors?: Json
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          short_name: string
          updated_at?: string
        }
        Update: {
          colors?: Json
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          short_name?: string
          updated_at?: string
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
      match_status:
        | "scheduled"
        | "live"
        | "finished"
        | "postponed"
        | "cancelled"
      pass_status: "active" | "inactive" | "expired" | "coming_soon" | "raffle"
      redemption_type:
        | "web"
        | "physical"
        | "carnetx_scan"
        | "promo_code"
        | "external_link"
      sport_category: "individual" | "colectivo"
      team_gender: "male" | "female" | "mixed"
      user_role: "superadmin" | "mesa_tecnica"
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
      match_status: ["scheduled", "live", "finished", "postponed", "cancelled"],
      pass_status: ["active", "inactive", "expired", "coming_soon", "raffle"],
      redemption_type: [
        "web",
        "physical",
        "carnetx_scan",
        "promo_code",
        "external_link",
      ],
      sport_category: ["individual", "colectivo"],
      team_gender: ["male", "female", "mixed"],
      user_role: ["superadmin", "mesa_tecnica"],
    },
  },
} as const
