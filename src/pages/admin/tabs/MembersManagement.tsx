import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarUrl } from "@/lib/avatar";
import type { Database } from "@/types/database.types";

type ProjectMember = Database['public']['Tables']['project_members']['Row'] & {
  profile: Database['public']['Tables']['profiles']['Row'];
  project: Database['public']['Tables']['projects']['Row'];
};

export function MembersManagement() {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profile:profiles(*),
          project:projects(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load team members",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: Database['public']['Enums']['project_role']) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member role updated successfully",
      });

      fetchMembers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update member role",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully",
      });

      fetchMembers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member",
      });
    }
  };

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      member.profile.full_name?.toLowerCase().includes(searchLower) ||
      member.project.name.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={getAvatarUrl(member.profile.full_name || '')}
                        alt={member.profile.full_name || ''}
                      />
                      <AvatarFallback>
                        {member.profile.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.profile.title}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{member.project.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(member.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateMemberRole(member.id, 'admin')}
                      >
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateMemberRole(member.id, 'moderator')}
                      >
                        Make Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateMemberRole(member.id, 'member')}
                      >
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => removeMember(member.id)}
                        className="text-red-600"
                      >
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            {searchQuery 
              ? "No members found matching your search criteria."
              : "No team members at the moment."}
          </p>
        </div>
      )}
    </div>
  );
} 