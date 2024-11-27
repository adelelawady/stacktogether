import { useNavigate } from "react-router-dom";
import { Calendar, MessageSquare, User2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatar";
import type { TaskWithDetails } from "@/types/project.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "react-day-picker";

interface TaskCardProps {
  task: TaskWithDetails;
  onSelect?: (task: TaskWithDetails) => void;
  isSelected?: boolean;
}

const priorityColors = {
  low: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  urgent: "bg-red-500/10 text-red-500",
};

export function TaskCard({ task, onSelect, isSelected }: TaskCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors",
        isSelected ? "border-primary" : "hover:border-primary/50"
      )}
      onClick={() => onSelect?.(task)}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-none">{task.title}</h3>
          <Badge 
            variant="secondary"
            className={cn("capitalize", priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            {task.assigned_to_profile && (
              <div className="flex items-center space-x-1">
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
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 