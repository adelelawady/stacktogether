import type { Database } from "./database.types";

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectMember = Database['public']['Tables']['project_members']['Row'];
export type ProjectSkill = Database['public']['Tables']['project_skills']['Row'];
export type ProjectJoinRequest = Database['public']['Tables']['project_join_requests']['Row'];

export type ProjectRole = 'owner' | 'admin' | 'moderator' | 'member';
export type ProjectStatus = 'active' | 'archived' | 'draft';
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ProjectWithDetails extends Project {
  members: (ProjectMember & {
    profile: Database['public']['Tables']['profiles']['Row']
  })[];
  skills: (ProjectSkill & {
    skill: Database['public']['Tables']['skills']['Row']
  })[];
  join_requests: (ProjectJoinRequest & {
    profile: Database['public']['Tables']['profiles']['Row']
  })[];
}

export interface ProjectFormData {
  name: string;
  description: string | null;
  content: string | null;
  code_url: string | null;
  demo_url: string | null;
  status: ProjectStatus;
  categories: string[];
  is_public: boolean;
} 