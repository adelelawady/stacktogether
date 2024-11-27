import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, Heart, Laugh, Angry, Frown } from "lucide-react";
import { format } from "date-fns";
import { getAvatarUrl } from "@/lib/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Comment, CommentReaction } from "@/types/project.types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const reactionTypes = [
  { type: 'like', icon: ThumbsUp, label: 'Like' },
  { type: 'love', icon: Heart, label: 'Love' },
  { type: 'laugh', icon: Laugh, label: 'Haha' },
  { type: 'angry', icon: Angry, label: 'Angry' },
  { type: 'sad', icon: Frown, label: 'Sad' },
] as const;

interface TaskCommentProps {
  comment: Comment;
  onUpdate: () => void;
  level?: number;
  maxLevel?: number;
}

export function TaskComment({ 
  comment, 
  onUpdate, 
  level = 0,
  maxLevel = 2  // Maximum nesting level
}: TaskCommentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  // Get all reactions for this comment
  const reactionCounts = reactionTypes.reduce((acc, { type }) => {
    const count = comment.comment_reactions?.filter(r => r.type === type).length || 0;
    if (count > 0) acc[type] = count;
    return acc;
  }, {} as Record<string, number>);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          task_id: comment.task_id,
          content: replyContent,
          created_by: user?.id,
          parent_id: comment.id,
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
      return;
    }

    setReplyContent("");
    setIsReplying(false);
    onUpdate();
  };

  const handleReaction = async (type: typeof reactionTypes[number]['type']) => {
    if (!user) return;

    const hasReaction = comment.comment_reactions?.some(
      r => r.type === type && r.created_by === user.id
    );

    if (hasReaction) {
      // Remove reaction
      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', comment.id)
        .eq('created_by', user.id)
        .eq('type', type);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove reaction",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('comment_reactions')
        .insert([
          {
            comment_id: comment.id,
            created_by: user.id,
            type,
          }
        ]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add reaction",
          variant: "destructive",
        });
        return;
      }
    }

    onUpdate();
  };

  return (
    <div className={cn(
      "space-y-2",
      level > 0 && "ml-8 pl-4 border-l border-muted"
    )}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={getAvatarUrl(
              comment.profile.full_name || '',
              comment.profile.avatar_style || 'lorelei'
            )}
            alt={comment.profile.full_name || ''}
          />
          <AvatarFallback>
            {comment.profile.full_name?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{comment.profile.full_name}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {format(new Date(comment.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            {level < maxLevel && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsReplying(!isReplying)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Reply
              </Button>
            )}
          </div>
          <p className="text-sm">{comment.content}</p>
          
          {/* Reactions */}
          <div className="flex items-center gap-2 mt-2">
            {/* Show reaction counts */}
            {Object.entries(reactionCounts).length > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                {Object.entries(reactionCounts).map(([type, count]) => {
                  const { icon: Icon } = reactionTypes.find(r => r.type === type)!;
                  return (
                    <TooltipProvider key={type}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            <span className="text-xs">{count}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {reactionTypes.find(r => r.type === type)?.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            )}

            {/* Add reaction button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setShowReactions(!showReactions)}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>

              {/* Reaction picker */}
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 bg-background border rounded-lg shadow-lg p-1 flex items-center gap-1">
                  {reactionTypes.map(({ type, icon: Icon, label }) => {
                    const hasReacted = comment.comment_reactions?.some(
                      r => r.type === type && r.created_by === user?.id
                    );
                    
                    return (
                      <TooltipProvider key={type}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={hasReacted ? "secondary" : "ghost"}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReaction(type);
                                setShowReactions(false);
                              }}
                            >
                              <Icon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="ml-11 mt-2 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsReplying(false);
                setReplyContent("");
              }}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleReply}
              disabled={isSubmitting || !replyContent.trim()}
            >
              Reply
            </Button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies?.map((reply) => (
        <TaskComment
          key={reply.id}
          comment={reply}
          onUpdate={onUpdate}
          level={level + 1}
          maxLevel={maxLevel}
        />
      ))}

      {/* Show nested replies count if any */}
      {comment.replies?.length > 0 && level === maxLevel && (
        <div className="text-sm text-muted-foreground ml-8">
          {comment.replies.length} more {comment.replies.length === 1 ? 'reply' : 'replies'}
        </div>
      )}
    </div>
  );
} 