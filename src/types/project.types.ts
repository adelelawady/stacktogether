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

export type TaskListType = 'todo' | 'in_progress' | 'review' | 'done' | 'backlog';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type TaskList = Database['public']['Tables']['task_lists']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'] & {
  profile: Database['public']['Tables']['profiles']['Row'];
  comment_reactions: CommentReaction[];
  replies?: Comment[];
};
export type CommentReaction = Database['public']['Tables']['comment_reactions']['Row'] & {
  profile: Database['public']['Tables']['profiles']['Row'];
};

export interface TaskWithDetails extends Task {
  created_by_profile: Database['public']['Tables']['profiles']['Row'];
  assigned_to_profile?: Database['public']['Tables']['profiles']['Row'];
  comments: Comment[];
}

export interface TaskListWithDetails extends TaskList {
  tasks: TaskWithDetails[];
}

export type CommentSortOption = 'newest' | 'oldest' | 'most_reactions';
 