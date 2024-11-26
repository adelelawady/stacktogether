import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { CategorySelect } from "@/components/CategorySelect";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save } from "lucide-react";
import Navigation from "@/components/Navigation";
import { ProjectBasicInfo } from "@/components/projects/ProjectBasicInfo";
import { ProjectContent } from "@/components/projects/ProjectContent";
import { ProjectLinks } from "@/components/projects/ProjectLinks";
import { ProjectSettings } from "@/components/projects/ProjectSettings";
import type { Category } from "@/types/database.types";
import type { ProjectFormData, Project } from "@/types/project.types";
import { Label } from "@/components/ui/label";

const ProjectForm = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    content: '',
    code_url: '',
    demo_url: '',
    status: 'draft',
    categories: [],
    is_public: true,
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Load project data if editing
      if (projectId) {
        const { data: project, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        if (project) {
          setFormData({
            name: project.name,
            description: project.description || '',
            content: project.content || '',
            code_url: project.code_url || '',
            demo_url: project.demo_url || '',
            status: project.status,
            categories: project.categories || [],
            is_public: project.is_public,
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const projectData = {
        ...formData,
        owner_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (projectId) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Project updated successfully!",
        });
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();

        if (error) throw error;

        // Create owner as first member
        await supabase
          .from('project_members')
          .insert({
            project_id: data.id,
            profile_id: user.id,
            role: 'owner',
            status: 'approved',
          });

        toast({
          title: "Success",
          description: "Project created successfully!",
        });
      }

      navigate(`/projects/${projectId || ''}`);
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save project",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{projectId ? 'Edit' : 'Create'} Project</CardTitle>
            <CardDescription>
              {projectId ? 'Update your project details' : 'Create a new project'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <ProjectBasicInfo
                  formData={formData}
                  handleInputChange={handleInputChange}
                />

                <ProjectContent
                  content={formData.content || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value || '' }))}
                />

                <ProjectLinks
                  formData={formData}
                  handleInputChange={handleInputChange}
                />

                <div className="space-y-4">
                  <Label>Categories</Label>
                  <CategorySelect
                    categories={categories}
                    selectedCategories={formData.categories}
                    onChange={(categories) => setFormData(prev => ({ ...prev, categories }))}
                  />
                </div>

                <ProjectSettings
                  formData={formData}
                  onVisibilityChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_public: checked }))
                  }
                  onStatusChange={(value) => 
                    setFormData(prev => ({ ...prev, status: value as Project['status'] }))
                  }
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {projectId ? 'Update' : 'Create'} Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProjectForm;