import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GitFork, ExternalLink, Users } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import type { ProjectWithDetails } from "@/types/project.types";

interface ProjectOverviewProps {
  project: ProjectWithDetails;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Project Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {project.description || 'No description provided.'}
          </div>
        </CardContent>
      </Card>

      {/* Project Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {project.code_url && (
              <a
                href={project.code_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <GitFork className="h-4 w-4" />
                <span>Source Code</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Live Demo</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {project.categories?.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {project.skills?.map((skill) => (
                  <Badge key={skill.skill.id} variant="outline">
                    {skill.skill.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Team Members</h4>
              <div className="flex -space-x-2">
                {project.members?.slice(0, 5).map((member) => (
                  <Avatar key={member.profile.id} className="border-2 border-background">
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
                ))}
                {project.members?.length > 5 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
                    +{project.members.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 