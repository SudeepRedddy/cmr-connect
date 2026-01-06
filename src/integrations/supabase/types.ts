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
      campus_locations: {
        Row: {
          building: string
          capacity: number | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          facilities: string[] | null
          floor: number
          id: string
          is_active: boolean | null
          location_type: string
          name: string
          room_number: string | null
        }
        Insert: {
          building: string
          capacity?: number | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          facilities?: string[] | null
          floor?: number
          id?: string
          is_active?: boolean | null
          location_type: string
          name: string
          room_number?: string | null
        }
        Update: {
          building?: string
          capacity?: number | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          facilities?: string[] | null
          floor?: number
          id?: string
          is_active?: boolean | null
          location_type?: string
          name?: string
          room_number?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          images: string[] | null
          role: string
          suggestions: string[] | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          role: string
          suggestions?: string[] | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          role?: string
          suggestions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_analytics: {
        Row: {
          created_at: string | null
          id: string
          question: string
          response: string | null
          session_id: string | null
          user_id: string | null
          user_role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question: string
          response?: string | null
          session_id?: string | null
          user_id?: string | null
          user_role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question?: string
          response?: string | null
          session_id?: string | null
          user_id?: string | null
          user_role?: string
        }
        Relationships: []
      }
      chatbot_feedback: {
        Row: {
          analytics_id: string | null
          created_at: string | null
          id: string
          message_id: string
          rating: string
          user_id: string | null
        }
        Insert: {
          analytics_id?: string | null
          created_at?: string | null
          id?: string
          message_id: string
          rating: string
          user_id?: string | null
        }
        Update: {
          analytics_id?: string | null
          created_at?: string | null
          id?: string
          message_id?: string
          rating?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_feedback_analytics_id_fkey"
            columns: ["analytics_id"]
            isOneToOne: false
            referencedRelation: "chatbot_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          is_active: boolean | null
          target_audience: string[] | null
          title: string
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          is_active?: boolean | null
          target_audience?: string[] | null
          title: string
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          is_active?: boolean | null
          target_audience?: string[] | null
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      exam_schedules: {
        Row: {
          created_at: string
          department: string
          end_time: string
          exam_date: string
          exam_name: string
          exam_type: string
          id: string
          semester: number
          start_time: string
          subject_code: string
          subject_name: string
          venue: string | null
          year: number
        }
        Insert: {
          created_at?: string
          department: string
          end_time: string
          exam_date: string
          exam_name: string
          exam_type?: string
          id?: string
          semester: number
          start_time: string
          subject_code: string
          subject_name: string
          venue?: string | null
          year: number
        }
        Update: {
          created_at?: string
          department?: string
          end_time?: string
          exam_date?: string
          exam_name?: string
          exam_type?: string
          id?: string
          semester?: number
          start_time?: string
          subject_code?: string
          subject_name?: string
          venue?: string | null
          year?: number
        }
        Relationships: []
      }
      faculty: {
        Row: {
          created_at: string | null
          department: string
          designation: string
          employee_id: string
          experience_years: number | null
          id: string
          publications_count: number | null
          qualifications: string | null
          specialization: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department: string
          designation: string
          employee_id: string
          experience_years?: number | null
          id?: string
          publications_count?: number | null
          qualifications?: string | null
          specialization?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string
          designation?: string
          employee_id?: string
          experience_years?: number | null
          id?: string
          publications_count?: number | null
          qualifications?: string | null
          specialization?: string | null
          user_id?: string
        }
        Relationships: []
      }
      live_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_role: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_role: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_sessions: {
        Row: {
          accepted_at: string | null
          closed_at: string | null
          created_at: string
          department: string | null
          faculty_id: string | null
          id: string
          status: string
          student_id: string
          topic: string | null
        }
        Insert: {
          accepted_at?: string | null
          closed_at?: string | null
          created_at?: string
          department?: string | null
          faculty_id?: string | null
          id?: string
          status?: string
          student_id: string
          topic?: string | null
        }
        Update: {
          accepted_at?: string | null
          closed_at?: string | null
          created_at?: string
          department?: string | null
          faculty_id?: string | null
          id?: string
          status?: string
          student_id?: string
          topic?: string | null
        }
        Relationships: []
      }
      notices: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          target_audience: string[] | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          target_audience?: string[] | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          target_audience?: string[] | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          attendance_percentage: number | null
          batch_year: number
          cgpa: number | null
          created_at: string | null
          department: string
          id: string
          roll_number: string
          section: string | null
          user_id: string
          year: number
        }
        Insert: {
          attendance_percentage?: number | null
          batch_year: number
          cgpa?: number | null
          created_at?: string | null
          department: string
          id?: string
          roll_number: string
          section?: string | null
          user_id: string
          year: number
        }
        Update: {
          attendance_percentage?: number | null
          batch_year?: number
          cgpa?: number | null
          created_at?: string | null
          department?: string
          id?: string
          roll_number?: string
          section?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      timetable: {
        Row: {
          created_at: string | null
          day_of_week: number
          department: string
          end_time: string
          faculty_id: string | null
          id: string
          period_number: number
          room_number: string | null
          section: string | null
          start_time: string
          subject_name: string
          year: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          department: string
          end_time: string
          faculty_id?: string | null
          id?: string
          period_number: number
          room_number?: string | null
          section?: string | null
          start_time: string
          subject_name: string
          year: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          department?: string
          end_time?: string
          faculty_id?: string | null
          id?: string
          period_number?: number
          room_number?: string | null
          section?: string | null
          start_time?: string
          subject_name?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "timetable_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
    }
    Enums: {
      app_role: "admin" | "student" | "faculty"
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
      app_role: ["admin", "student", "faculty"],
    },
  },
} as const
