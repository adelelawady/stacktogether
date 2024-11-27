import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Calendar, Clock, AlertCircle, MessageSquare, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { TaskComment } from "./TaskComment";
import { format } from "date-fns";
import { getAvatarUrl } from "@/lib/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskWithDetails, ProjectMember } from "@/types/project.types";

interface TaskDetailsProps {
  taskId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const priorityColors = {
  low: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  urgent: "bg-red-500/10 text-red-500",
};

export function TaskDetails({ taskId, onClose, onUpdate }: TaskDetailsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  useEffect(() => {
    loadTask();
    loadProjectMembers();
  }, [taskId]);

  const loadTask = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        created_by_profile:profiles!tasks_created_by_fkey(*),
        assigned_to_profile:profiles!tasks_assigned_to_fkey(*),
        comments!task_id(
          *,
          profile:profiles(*),
          comment_reactions(
            *,
            profile:profiles(*)
          ),
          replies:comments!parent_id(
            *,
            profile:profiles(*),
            comment_reactions(
              *,
              profile:profiles(*)
            ),
            nested_replies:comments!parent_id(
              *,
              profile:profiles(*),
              comment_reactions(
                *,
                profile:profiles(*)
              )
            )
          )
        )
      `)
      .eq('id', taskId)
      .is('comments.parent_id', null)
      .single();

    if (error) {
      console.error('Error loading task:', error);
      return;
    }

    const transformedData = {
      ...data,
      comments: data.comments.map((comment: any) => ({
        ...comment,
        comment_reactions: comment.comment_reactions || [],
        replies: (comment.replies || []).map((reply: any) => ({
          ...reply,
          comment_reactions: reply.comment_reactions || [],
          replies: (reply.nested_replies || []).map((nestedReply: any) => ({
            ...nestedReply,
            comment_reactions: nestedReply.comment_reactions || []
          }))
        }))
      }))
    };

    setTask(transformedData);
    setDescription(transformedData.description || '');
  };

  const loadProjectMembers = async () => {
    if (!task?.project_id) return;

    const { data } = await supabase
      .from('project_members')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('project_id', task.project_id);

    setProjectMembers(data || []);
  };

  const handleDescriptionSave = async () => {
    if (!task) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from('tasks')
      .update({ description })
      .eq('id', task.id);

    setIsSubmitting(false);
    setIsEditing(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update description",
      });
      return;
    }

    loadTask();
  };

  const handleCommentSubmit = async () => {
    if (!task || !comment.trim()) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          task_id: task.id,
          content: comment,
          created_by: task.created_by,
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment",
      });
      return;
    }

    setComment("");
    loadTask();
  };

  const handleAssign = async (profileId: string) => {
    if (!task) return;
    
    const { error } = await supabase
      .from('tasks')
      .update({ assigned_to: profileId })
      .eq('id', task.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign task",
        variant: "destructive",
      });
      return;
    }

    loadTask();
  };

  if (!task) return null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="border-b p-4 bg-muted/50">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">{task.title}</h3>
              <Badge variant="outline" className={cn("capitalize", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Overdue
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {format(new Date(task.created_at), 'MMM d, yyyy')}</span>
              </div>
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Assignee & Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Label className="text-muted-foreground">Assigned to</Label>
            {task.assigned_to_profile ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={getAvatarUrl(
                      task.assigned_to_profile.full_name || '',
                      task.assigned_to_profile.avatar_style || 'lorelei'
                    )}
                    alt={task.assigned_to_profile.full_name || ''}
                  />
                  <AvatarFallback>
                    {task.assigned_to_profile.full_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{task.assigned_to_profile.full_name}</span>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Assign
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {projectMembers.map((member) => (
                    <DropdownMenuItem 
                      key={member.profile_id}
                      onClick={() => handleAssign(member.profile_id)}
                    >
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={getAvatarUrl(
                            member.profile.full_name || '',
                            member.profile.avatar_style || 'lorelei'
                          )}
                          alt={member.profile.full_name || ''}
                        />
                        <AvatarFallback>
                          {member.profile.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      {member.profile.full_name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <Badge variant="outline" className="capitalize">
            {task.status}
          </Badge>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Description</Label>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                rows={4}
                className="resize-none"
              />
              <Button size="sm" onClick={handleDescriptionSave} disabled={isSubmitting}>
                Save
              </Button>
            </div>
          ) : (
            <div className="rounded-lg bg-muted/40 p-4 min-h-[100px]">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="space-y-4 border-t pt-4">
          <Label className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({task.comments.length})
          </Label>
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button 
                  size="sm"
                  onClick={handleCommentSubmit}
                  disabled={isSubmitting || !comment.trim()}
                >
                  Add Comment
                </Button>
              </div>
            </div>
            <div className="space-y-4 mt-6">
              {task.comments.map((comment) => (
                <TaskComment
                  key={comment.id}
                  comment={comment}
                  onUpdate={loadTask}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 