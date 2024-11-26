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
import { Search, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAvatarUrl } from "@/lib/avatar";
import type { Database } from "@/types/database.types";

type JoinRequest = Database['public']['Tables']['project_join_requests']['Row'] & {
  profile: Database['public']['Tables']['profiles']['Row'];
  project: Database['public']['Tables']['projects']['Row'];
};

export function JoinRequestsManagement() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('project_join_requests')
        .select(`
          *,
          profile:profiles(*),
          project:projects(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load join requests",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('project_join_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${status} successfully`,
      });

      fetchRequests();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${status} request`,
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      request.profile.full_name?.toLowerCase().includes(searchLower) ||
      request.project.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
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
              <TableHead>User</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={getAvatarUrl(request.profile.full_name || '')}
                        alt={request.profile.full_name || ''}
                      />
                      <AvatarFallback>
                        {request.profile.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.profile.title}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{request.project.name}</TableCell>
                <TableCell>{request.message || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === 'approved' 
                        ? 'success' 
                        : request.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0"
                        onClick={() => handleRequestAction(request.id, 'approved')}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0"
                        onClick={() => handleRequestAction(request.id, 'rejected')}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            {searchQuery 
              ? "No requests found matching your search criteria."
              : "No join requests at the moment."}
          </p>
        </div>
      )}
    </div>
  );
} 