import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User2, ArrowLeft } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import { supabase } from "@/integrations/supabase/client";
import { TaskComment } from "@/components/projects/TaskComment";
import type { TaskWithDetails, CommentSortOption } from "@/types/project.types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const TaskDetails = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOption, setSortOption] = useState<CommentSortOption>('newest');

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        created_by_profile:profiles!tasks_created_by_fkey(*),
        assigned_to_profile:profiles!tasks_assigned_to_fkey(*),
        comments(
          *,
          profile:profiles(*)
        )
      `)
      .eq('id', taskId)
      .single();

    if (taskError) {
      console.error('Error loading task:', taskError);
      return;
    }

    const commentIds = taskData.comments.map(comment => comment.id);
    if (commentIds.length > 0) {
      const { data: repliesData, error: repliesError } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(*)
        `)
        .in('parent_id', commentIds);

      if (repliesError) {
        console.error('Error loading replies:', repliesError);
      } else {
        const commentsWithReplies = taskData.comments.map(comment => ({
          ...comment,
          replies: repliesData?.filter(reply => reply.parent_id === comment.id) || []
        }));
        taskData.comments = commentsWithReplies;
      }
    }

    setTask(taskData);
    setDescription(taskData.description || '');
  };

  const handleDescriptionSave = async () => {
    if (!task) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from('tasks')
      .update({ description })
      .eq('id', task.id);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task description",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(false);
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
          created_by: user?.id,
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return;
    }

    setComment("");
    loadTask();
  };

  const sortedComments = useMemo(() => {
    if (!task?.comments) return [];
    
    return [...task.comments].sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_reactions':
          return (b.reactions?.length || 0) - (a.reactions?.length || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [task?.comments, sortOption]);

  if (!task) return null;

  return (
    <div className="container max-w-4xl py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Project
      </Button>

      <main className="space-y-6">
        <Card>
          <CardHeader className="space-y-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <Badge variant="outline" className="capitalize">
                {task.priority}
              </Badge>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {task.due_date && (
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center">
                <User2 className="mr-2 h-4 w-4" />
                {task.assigned_to_profile ? (
                  <div className="flex items-center space-x-2">
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
                    <span>{task.assigned_to_profile.full_name}</span>
                  </div>
                ) : (
                  <span>Unassigned</span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Description</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write task description..."
                    rows={5}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleDescriptionSave}
                      disabled={isSubmitting}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {task.description || 'No description provided.'}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Comments</h3>
                <Select
                  value={sortOption}
                  onValueChange={(value) => setSortOption(value as CommentSortOption)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="most_reactions">Most reactions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                {sortedComments.map((comment) => (
                  <TaskComment
                    key={comment.id}
                    comment={comment}
                    onUpdate={loadTask}
                  />
                ))}

                <div className="space-y-2">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCommentSubmit}
                      disabled={isSubmitting || !comment.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TaskDetails; 