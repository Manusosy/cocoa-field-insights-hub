export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      farm_visits: {
        Row: {
          bean_quality: string | null
          cocoa_tree_age: number | null
          created_at: string | null
          farmer_id: string
          field_officer_id: string
          gps_latitude: number | null
          gps_longitude: number | null
          humidity_level: number | null
          id: string
          pest_disease_signs: string | null
          polygon_boundaries: Json | null
          soil_type: string | null
          status: Database["public"]["Enums"]["visit_status"] | null
          visit_date: string | null
          visit_notes: string | null
          visit_number: number | null
        }
        Insert: {
          bean_quality?: string | null
          cocoa_tree_age?: number | null
          created_at?: string | null
          farmer_id: string
          field_officer_id: string
          gps_latitude?: number | null
          gps_longitude?: number | null
          humidity_level?: number | null
          id?: string
          pest_disease_signs?: string | null
          polygon_boundaries?: Json | null
          soil_type?: string | null
          status?: Database["public"]["Enums"]["visit_status"] | null
          visit_date?: string | null
          visit_notes?: string | null
          visit_number?: number | null
        }
        Update: {
          bean_quality?: string | null
          cocoa_tree_age?: number | null
          created_at?: string | null
          farmer_id?: string
          field_officer_id?: string
          gps_latitude?: number | null
          gps_longitude?: number | null
          humidity_level?: number | null
          id?: string
          pest_disease_signs?: string | null
          polygon_boundaries?: Json | null
          soil_type?: string | null
          status?: Database["public"]["Enums"]["visit_status"] | null
          visit_date?: string | null
          visit_notes?: string | null
          visit_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_visits_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_visits_field_officer_id_fkey"
            columns: ["field_officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          created_at: string | null
          farmer_photo_url: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          id_number: string | null
          id_type: Database["public"]["Enums"]["id_type"]
          phone_number: string
          region: string
          registered_by: string
          sub_county: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          farmer_photo_url?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id?: string
          id_number?: string | null
          id_type?: Database["public"]["Enums"]["id_type"]
          phone_number: string
          region: string
          registered_by: string
          sub_county?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          farmer_photo_url?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          id_number?: string | null
          id_type?: Database["public"]["Enums"]["id_type"]
          phone_number?: string
          region?: string
          registered_by?: string
          sub_county?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          created_at: string | null
          description: string
          evidence_url: string | null
          field_officer_id: string
          id: string
          issue_type: Database["public"]["Enums"]["issue_type"]
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["issue_status"] | null
          supervisor_comments: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          evidence_url?: string | null
          field_officer_id: string
          id?: string
          issue_type: Database["public"]["Enums"]["issue_type"]
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["issue_status"] | null
          supervisor_comments?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          evidence_url?: string | null
          field_officer_id?: string
          id?: string
          issue_type?: Database["public"]["Enums"]["issue_type"]
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["issue_status"] | null
          supervisor_comments?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_field_officer_id_fkey"
            columns: ["field_officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_targets: {
        Row: {
          created_at: string | null
          field_officer_id: string
          id: string
          total_farm_target: number
          visit_1_target: number | null
          visit_2_target: number | null
          visit_3_target: number | null
          visit_4_target: number | null
          visit_5_target: number | null
          visit_6_target: number | null
          visit_7_target: number | null
        }
        Insert: {
          created_at?: string | null
          field_officer_id: string
          id?: string
          total_farm_target?: number
          visit_1_target?: number | null
          visit_2_target?: number | null
          visit_3_target?: number | null
          visit_4_target?: number | null
          visit_5_target?: number | null
          visit_6_target?: number | null
          visit_7_target?: number | null
        }
        Update: {
          created_at?: string | null
          field_officer_id?: string
          id?: string
          total_farm_target?: number
          visit_1_target?: number | null
          visit_2_target?: number | null
          visit_3_target?: number | null
          visit_4_target?: number | null
          visit_5_target?: number | null
          visit_6_target?: number | null
          visit_7_target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_targets_field_officer_id_fkey"
            columns: ["field_officer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assigned_supervisor_id: string | null
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone_number: string | null
          region: string | null
          role: Database["public"]["Enums"]["user_role"]
          sub_county: string | null
          uai_code: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_supervisor_id?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          phone_number?: string | null
          region?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sub_county?: string | null
          uai_code?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_supervisor_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string | null
          region?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sub_county?: string | null
          uai_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_assigned_supervisor_id_fkey"
            columns: ["assigned_supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          field_officer_id: string
          id: string
          preferred_region: string
          reason: string
          status: Database["public"]["Enums"]["transfer_status"] | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          field_officer_id: string
          id?: string
          preferred_region: string
          reason: string
          status?: Database["public"]["Enums"]["transfer_status"] | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          field_officer_id?: string
          id?: string
          preferred_region?: string
          reason?: string
          status?: Database["public"]["Enums"]["transfer_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_field_officer_id_fkey"
            columns: ["field_officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_media: {
        Row: {
          created_at: string | null
          exif_data: Json | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          media_type: string
          media_url: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string | null
          exif_data?: Json | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          media_type: string
          media_url: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string | null
          exif_data?: Json | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          media_type?: string
          media_url?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_media_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "farm_visits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gender_type: "male" | "female" | "other"
      id_type: "national_id" | "passport" | "none"
      issue_status: "open" | "under_review" | "resolved" | "rejected"
      issue_type:
        | "uncooperative_farmer"
        | "inaccessible_area"
        | "equipment_failure"
        | "weather_conditions"
        | "other"
      transfer_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "supervisor" | "analyst" | "field_officer"
      visit_status: "completed" | "incomplete" | "in_progress"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      gender_type: ["male", "female", "other"],
      id_type: ["national_id", "passport", "none"],
      issue_status: ["open", "under_review", "resolved", "rejected"],
      issue_type: [
        "uncooperative_farmer",
        "inaccessible_area",
        "equipment_failure",
        "weather_conditions",
        "other",
      ],
      transfer_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "supervisor", "analyst", "field_officer"],
      visit_status: ["completed", "incomplete", "in_progress"],
    },
  },
} as const
