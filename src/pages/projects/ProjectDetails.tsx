import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Edit, Users, GitFork, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import MDEditor from "@uiw/react-md-editor";
import type { ProjectWithDetails } from "@/types/project.types";
import { getAvatarUrl } from "@/lib/avatar";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoinRequestPending, setIsJoinRequestPending] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          members:project_members(
            *,
            profile:profiles(*)
          ),
          skills:project_skills(
            *,
            skill:skills(*)
          ),
          join_requests:project_join_requests(
            *,
            profile:profiles(*)
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);

      // Check if user has a pending join request
      if (user && data) {
        const hasRequest = data.join_requests.some(
          req => req.profile_id === user.id && req.status === 'pending'
        );
        setIsJoinRequestPending(hasRequest);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!user || !project) return;

    try {
      const { error } = await supabase
        .from('project_join_requests')
        .insert({
          project_id: project.id,
          profile_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      setIsJoinRequestPending(true);
      toast({
        title: "Success",
        description: "Join request sent successfully!",
      });
    } catch (error) {
      console.error('Error sending join request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send join request",
      });
    }
  };

  const canEdit = project?.members.some(
    member => 
      member.profile_id === user?.id && 
      ['owner', 'admin', 'moderator'].includes(member.role)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
            <p className="mt-2 text-gray-600">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button
              onClick={() => navigate("/projects")}
              className="mt-4"
            >
              Back to Projects
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Project Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="mt-2 text-gray-600">{project.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {canEdit && (
                <Button
                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              )}
              {user && !project.members.some(m => m.profile_id === user.id) && (
                <Button
                  onClick={handleJoinRequest}
                  disabled={isJoinRequestPending}
                >
                  {isJoinRequestPending ? "Request Pending" : "Join Project"}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Content */}
              <Card>
                <CardContent className="pt-6">
                  <div data-color-mode="light">
                    <MDEditor.Markdown source={project.content || 'No content available.'} />
                  </div>
                </CardContent>
              </Card>

              {/* Project Skills */}
              {project.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((ps) => (
                        <Badge key={ps.skill_id}>
                          {ps.skill.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.code_url && (
                    <a
                      href={project.code_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      <GitFork className="mr-2 h-4 w-4" />
                      View Code Repository
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Demo
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Project Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={getAvatarUrl(member.profile.full_name || '',member.profile.avatar_style)}
                            alt={member.profile.full_name || ''}
                          />
                          <AvatarFallback>
                            {member.profile.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.profile.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Categories */}
              {project.categories && project.categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="capitalize">
                          {category.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails; 