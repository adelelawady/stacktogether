import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarUrl } from "@/lib/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProjectMember } from "@/types/project.types";

interface ProjectMembersProps {
  projectId: string;
  compact?: boolean;
}

export function ProjectMembers({ projectId, compact = false }: ProjectMembersProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('project_id', projectId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load team members",
      });
      return;
    }

    setMembers(data || []);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const displayName = member.profile.full_name || 'Anonymous User';
          return (
            <TooltipProvider key={member.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getAvatarUrl(
                        displayName,
                        member.profile.avatar_style || 'lorelei'
                      )}
                      alt={displayName}
                    />
                    <AvatarFallback>
                      {displayName[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{displayName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
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
                  <div>
                    <p className="font-medium">{member.profile.full_name}</p>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {member.role}
                    </Badge>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 