export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          created_at: string
          updated_at: string
          title: string | null
          years_of_experience: number | null
          github_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          website_url: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
          title?: string | null
          years_of_experience?: number | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
          title?: string | null
          years_of_experience?: number | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          profile_id: string
          skill_id: string
          created_at: string
          skills: Database['public']['Tables']['skills']['Row']
        }
        Insert: {
          id?: string
          profile_id: string
          skill_id: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          skill_id?: string
          created_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T] 