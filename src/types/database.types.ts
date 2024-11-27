export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin' | 'moderator';
export type ProjectRole = 'owner' | 'admin' | 'moderator' | 'member';
export type ProjectStatus = 'active' | 'archived' | 'draft';
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';
export type AvatarStyle = 'circle' | 'square' | 'rounded' | 'none';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          avatar_style: AvatarStyle | null
          location: string | null
          created_at: string
          updated_at: string
          title: string | null
          years_of_experience: number | null
          github_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          website_url: string | null
          categories: string[] | null
          role: UserRole
          email: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          avatar_style?: AvatarStyle | null
          location?: string | null
          created_at?: string
          updated_at?: string
          title?: string | null
          years_of_experience?: number | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          categories?: string[] | null
          role?: UserRole
          email?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          avatar_style?: AvatarStyle | null
          location?: string | null
          created_at?: string
          updated_at?: string
          title?: string | null
          years_of_experience?: number | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          categories?: string[] | null
          role?: UserRole
          email?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          content: string | null
          code_url: string | null
          demo_url: string | null
          status: ProjectStatus
          created_at: string
          updated_at: string
          owner_id: string
          categories: string[] | null
          is_public: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          content?: string | null
          code_url?: string | null
          demo_url?: string | null
          status?: ProjectStatus
          created_at?: string
          updated_at?: string
          owner_id: string
          categories?: string[] | null
          is_public?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          content?: string | null
          code_url?: string | null
          demo_url?: string | null
          status?: ProjectStatus
          created_at?: string
          updated_at?: string
          owner_id?: string
          categories?: string[] | null
          is_public?: boolean
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          profile_id: string
          role: ProjectRole
          status: JoinRequestStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          profile_id: string
          role?: ProjectRole
          status?: JoinRequestStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          profile_id?: string
          role?: ProjectRole
          status?: JoinRequestStatus
          created_at?: string
          updated_at?: string
        }
      }
      project_skills: {
        Row: {
          id: string
          project_id: string
          skill_id: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          skill_id: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          skill_id?: string
          created_at?: string
        }
      }
      project_join_requests: {
        Row: {
          id: string
          project_id: string
          profile_id: string
          message: string | null
          status: JoinRequestStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          profile_id: string
          message?: string | null
          status?: JoinRequestStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          profile_id?: string
          message?: string | null
          status?: JoinRequestStatus
          created_at?: string
          updated_at?: string
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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          is_active?: boolean
        }
      }
      task_lists: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          type: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          type: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          type?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_lists_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };

      tasks: {
        Row: {
          id: string;
          list_id: string;
          project_id: string;
          title: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'todo' | 'in_progress' | 'review' | 'done';
          position: number;
          due_date: string | null;
          created_by: string;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          project_id: string;
          title: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'todo' | 'in_progress' | 'review' | 'done';
          position?: number;
          due_date?: string | null;
          created_by: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'todo' | 'in_progress' | 'review' | 'done';
          position?: number;
          due_date?: string | null;
          created_by?: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "task_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      comments: {
        Row: {
          id: string;
          task_id: string;
          content: string;
          created_by: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          content: string;
          created_by: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          content?: string;
          created_by?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          }
        ];
      };

      comment_reactions: {
        Row: {
          id: string;
          comment_id: string;
          created_by: string;
          type: 'like' | 'love' | 'laugh' | 'angry' | 'sad';
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          created_by: string;
          type: 'like' | 'love' | 'laugh' | 'angry' | 'sad';
          created_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          created_by?: string;
          type?: 'like' | 'love' | 'laugh' | 'angry' | 'sad';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_reactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      project_role: ProjectRole
      project_status: ProjectStatus
      join_request_status: JoinRequestStatus
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]

// Helper type for project with related data
export interface ProjectWithDetails extends Database['public']['Tables']['projects']['Row'] {
  members: (Database['public']['Tables']['project_members']['Row'] & {
    profile: Database['public']['Tables']['profiles']['Row']
  })[];
  skills: (Database['public']['Tables']['project_skills']['Row'] & {
    skill: Database['public']['Tables']['skills']['Row']
  })[];
  join_requests: (Database['public']['Tables']['project_join_requests']['Row'] & {
    profile: Database['public']['Tables']['profiles']['Row']
  })[];
} 