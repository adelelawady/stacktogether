import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ProjectOverview } from "@/components/projects/ProjectOverview";
import { ProjectTasks } from "@/components/projects/ProjectTasks";
import { ProjectMembers } from "@/components/projects/ProjectMembers";
import { ProjectContent } from "@/components/projects/ProjectContent";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { Layout, ListTodo, Users as UsersIcon, FileText, ChevronRight, Edit } from "lucide-react";
import Navigation from "@/components/Navigation";
import type { ProjectWithDetails, TaskListWithDetails, TaskWithDetails } from "@/types/project.types";
import { cn } from "@/lib/utils";
import { MDXEditor } from "@/components/ui/mdx-editor";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitFork, ExternalLink, Calendar, Users as TeamIcon } from "lucide-react";
import TaskDetails from "./TaskDetails";
import { format } from "date-fns";
import { CheckCircle2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type TabType = 'overview' | 'content' | 'tasks' | 'members';

const tabs: { id: TabType; label: string; icon: any }[] = [
  { id: 'content', label: 'Documentation', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'members', label: 'Team', icon: UsersIcon },
];

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [isLoading, setIsLoading] = useState(true);
  const [taskLists, setTaskLists] = useState<TaskListWithDetails[]>([]);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadTaskLists();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

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

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
      navigate('/projects');
      return;
    }

    setProject(data);
    setIsLoading(false);
  };

  const loadTaskLists = async () => {
    if (!projectId) return;

    const { data: lists, error: listsError } = await supabase
      .from('task_lists')
      .select(`
        *,
        tasks(
          *,
          created_by_profile:profiles!tasks_created_by_fkey(*),
          assigned_to_profile:profiles!tasks_assigned_to_fkey(*)
        )
      `)
      .eq('project_id', projectId)
      .order('position');

    if (listsError) {
      console.error('Error loading task lists:', listsError);
      return;
    }

    setTaskLists(lists || []);
  };

  const isProjectMember = project?.members.some(
    member => member.profile_id === user?.id
  );

  const handleTaskListsUpdate = (lists: TaskListWithDetails[]) => {
    setTaskLists(lists);
  };

  // Helper functions for task calculations
  const calculateTaskStats = () => {
    if (!taskLists) return { total: 0, todo: 0, inProgress: 0, completed: 0 };
    
    return taskLists.reduce((acc, list) => {
      const tasks = list.tasks || [];
      const todoTasks = tasks.filter(t => t.status === 'todo' || list.type === 'todo').length;
      const inProgressTasks = tasks.filter(t => 
        t.status === 'in_progress' || 
        list.type === 'in_progress' || 
        t.status === 'review' || 
        list.type === 'review'
      ).length;
      const completedTasks = tasks.filter(t => t.status === 'done' || list.type === 'done').length;
      
      return {
        total: acc.total + tasks.length,
        todo: acc.todo + todoTasks,
        inProgress: acc.inProgress + inProgressTasks,
        completed: acc.completed + completedTasks
      };
    }, { total: 0, todo: 0, inProgress: 0, completed: 0 });
  };

  const calculateProgress = () => {
    const stats = calculateTaskStats();
    if (stats.total === 0) return 0;
    // Include both in progress and completed tasks in the progress calculation
    const progressTasks = stats.inProgress * 0.5 + stats.completed;
    return Math.round((progressTasks / stats.total) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-[600px] bg-white rounded-lg border"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        {/* Project Header */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div>
                <Breadcrumb>
                  <BreadcrumbItem>
                    <BreadcrumbLink as={Link} to="/projects">Projects</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbItem>
                  <BreadcrumbItem isCurrentPage>
                    <span className="font-medium text-gray-800">{project.name}</span>
                  </BreadcrumbItem>
                </Breadcrumb>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{project.name}</h1>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TeamIcon className="h-4 w-4" />
                  <span>{project.members.length} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                {project.code_url && (
                  <a
                    href={project.code_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <GitFork className="h-4 w-4" />
                    <span>Source Code</span>
                  </a>
                )}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>

              {project.description && (
                <p className="text-gray-600 max-w-3xl">{project.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {project.categories?.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {isProjectMember && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex items-center px-6 py-3 text-sm font-medium transition-colors rounded-t-lg",
                    activeTab === id
                      ? "bg-white border border-b-0 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg rounded-tl-none border min-h-[calc(100vh-20rem)]">
              <div className="p-6">
                {activeTab === 'content' && (
                  <ProjectContent content={project.content} />
                )}
                {activeTab === 'tasks' && (
                  <ProjectTasks 
                    projectId={project.id}
                    onTaskSelect={setSelectedTask}
                    selectedTaskId={selectedTask?.id}
                    onTaskListsUpdate={handleTaskListsUpdate}
                  />
                )}
                {activeTab === 'members' && <ProjectMembers projectId={project.id} />}
              </div>
            </div>
          </div>

          {/* Project Overview Sidebar */}
          <div className="w-80 space-y-6">
            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Project Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Members</span>
                  <span className="font-medium">{project.members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {format(new Date(project.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="capitalize">
                    {project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Project Links */}
            {(project.code_url || project.demo_url) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {project.code_url && (
                    <a
                      href={project.code_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <GitFork className="h-4 w-4" />
                      Source Code
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Live Demo
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Project Categories */}
            {project.categories?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Skills */}
            {project.skills?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <Badge key={skill.skill.id} variant="outline">
                        {skill.skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Task Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">
                      {calculateProgress()}%
                    </span>
                  </div>
                  <Progress value={calculateProgress()} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-orange-500" />
                      <span>To Do</span>
                    </div>
                    <span className="font-medium">
                      {calculateTaskStats().todo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>In Progress</span>
                    </div>
                    <span className="font-medium">
                      {calculateTaskStats().inProgress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Completed</span>
                    </div>
                    <span className="font-medium">
                      {calculateTaskStats().completed}
                    </span>
                  </div>
                </div>

                {/* Task Lists Summary */}
                <div className="space-y-3 pt-3 border-t">
                  {taskLists?.map(list => (
                    <div key={list.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {list.type}
                        </Badge>
                        <span>{list.name}</span>
                      </div>
                      <span className="font-medium">
                        {list.tasks.length} tasks
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails; 