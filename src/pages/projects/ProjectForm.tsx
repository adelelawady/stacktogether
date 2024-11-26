import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CategorySelect } from "@/components/CategorySelect";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save } from "lucide-react";
import Navigation from "@/components/Navigation";
import type { Category } from "@/types/database.types";
import type { ProjectFormData, Project } from "@/types/project.types";

const ProjectForm = () => {
  const { projectId: urlProjectId } = useParams();
  const [currentProjectId, setCurrentProjectId] = useState(urlProjectId);
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
  }, [urlProjectId]);

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
      if (urlProjectId) {
        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('id', urlProjectId)
          .single();

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

      if (currentProjectId) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', currentProjectId);

        if (error) throw error;
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

        setCurrentProjectId(data.id);
      }

      toast({
        title: "Success",
        description: `Project ${currentProjectId ? 'updated' : 'created'} successfully!`,
      });

      navigate(`/projects/${currentProjectId}`);
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
            <CardTitle>{currentProjectId ? 'Edit' : 'Create'} Project</CardTitle>
            <CardDescription>
              {currentProjectId ? 'Update your project details' : 'Create a new project'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="My Awesome Project"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    placeholder="A brief description of your project"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project Content</Label>
                  <div data-color-mode="light">
                    <MDEditor
                      value={formData.content || ''}
                      onChange={(value) => setFormData(prev => ({ ...prev, content: value || '' }))}
                      preview="edit"
                      height={400}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code_url">Code Repository URL</Label>
                    <Input
                      id="code_url"
                      name="code_url"
                      value={formData.code_url || ''}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username/project"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo_url">Demo URL</Label>
                    <Input
                      id="demo_url"
                      name="demo_url"
                      value={formData.demo_url || ''}
                      onChange={handleInputChange}
                      placeholder="https://my-project.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Categories</Label>
                  <CategorySelect
                    categories={categories}
                    selectedCategories={formData.categories}
                    onChange={(categories) => setFormData(prev => ({ ...prev, categories }))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Project Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Make project visible to everyone
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_public}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, is_public: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Project Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, status: value as Project['status'] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      {currentProjectId ? 'Update' : 'Create'} Project
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