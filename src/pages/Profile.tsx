import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import type { Database } from "@/types/database.types";
import { CategorySelect } from "@/components/CategorySelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, type AvatarStyle } from "@/lib/avatar";


type Profile = Database['public']['Tables']['profiles']['Row'];
type Skill = Database['public']['Tables']['skills']['Row'];
type UserSkill = Database['public']['Tables']['user_skills']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface ProfileFormData {
  full_name: string;
  title: string | null;
  bio: string | null;
  location: string | null;
  years_of_experience: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  categories: string[];
  avatar_style: AvatarStyle;
}

const avatarStyles: { value: AvatarStyle; label: string }[] = [
  { value: 'lorelei', label: 'Lorelei' },
  { value: 'bottts', label: 'Bottts' },
  { value: 'pixel-art', label: 'Pixel Art' },
  { value: 'avataaars', label: 'Avataaars' },
  { value: 'big-ears', label: 'Big Ears' },
  { value: 'adventurer', label: 'Adventurer' },
];

const Profile = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    title: '',
    bio: '',
    location: '',
    years_of_experience: 0,
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    website_url: '',
    categories: [],
    avatar_style: 'lorelei',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        title: profile.title || '',
        bio: profile.bio || '',
        location: profile.location || '',
        years_of_experience: profile.years_of_experience || 0,
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        twitter_url: profile.twitter_url || '',
        website_url: profile.website_url || '',
        categories: profile.categories || [],
        avatar_style: profile.avatar_style || 'lorelei',
      });
    }
  }, [profile]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

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

        // Load available skills
        const { data: skills } = await supabase
          .from('skills')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (skills) {
          setAvailableSkills(skills);
        }

        // Load user skills
        const { data: userSkills } = await supabase
          .from('user_skills')
          .select('*, skills(*)')
          .eq('profile_id', user.id);

        if (userSkills) {
          setUserSkills(userSkills);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : Number(value),
    }));
  };

  const handleSkillToggle = async (skillId: string) => {
    if (!user) return;

    try {
      const existingSkill = userSkills.find(us => us.skill_id === skillId);
      
      if (existingSkill) {
        // Remove skill
        await supabase
          .from('user_skills')
          .delete()
          .eq('id', existingSkill.id);
        
        setUserSkills(prev => prev.filter(us => us.id !== existingSkill.id));
      } else {
        // Add skill
        const { data, error } = await supabase
          .from('user_skills')
          .insert({
            profile_id: user.id,
            skill_id: skillId,
          })
          .select('*, skills(*)')
          .single();

        if (error) throw error;
        if (data) {
          setUserSkills(prev => [...prev, data]);
        }
      }
    } catch (error) {
      console.error('Error updating skills:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update skills",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile in AuthContext to update navbar
      await refreshProfile();

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarStyleChange = async (value: AvatarStyle) => {
    if (!user) return;
    
    try {
      // Generate new avatar URL with selected style
      const avatarUrl = getAvatarUrl(formData.full_name, value);
      
      // Update profile with new avatar style and URL
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_style: value,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile in AuthContext to update navbar
      await refreshProfile();

      // Update local state
      setFormData(prev => ({
        ...prev,
        avatar_style: value
      }));

      toast({
        title: "Success",
        description: "Avatar style updated successfully!",
      });
    } catch (error) {
      console.error('Error updating avatar style:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update avatar style",
      });
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
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information and skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={getAvatarUrl(formData.full_name, formData.avatar_style)}
                    alt={formData.full_name}
                  />
                  <AvatarFallback>
                    {formData.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label>Avatar Style</Label>
                  <br />
                  <small>Avatar icon is generated based on your name</small>
                  <Select
                    value={formData.avatar_style}
                    onValueChange={handleAvatarStyleChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarStyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    placeholder="Full Stack Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_of_experience">Years of Experience</Label>
                  <Input
                    id="years_of_experience"
                    name="years_of_experience"
                    type="number"
                    value={formData.years_of_experience || ''}
                    onChange={handleNumberChange}
                    min="0"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    name="github_url"
                    value={formData.github_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter URL</Label>
                  <Input
                    id="twitter_url"
                    name="twitter_url"
                    value={formData.twitter_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">Personal Website</Label>
                  <Input
                    id="website_url"
                    name="website_url"
                    value={formData.website_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Categories</Label>
                <p className="text-sm text-muted-foreground">
                  Select the categories that best describe your expertise
                </p>
                <CategorySelect
                  categories={categories}
                  selectedCategories={formData.categories}
                  onChange={(categories) => setFormData(prev => ({ ...prev, categories }))}
                />
              </div>

              <div className="space-y-4">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => {
                    const isSelected = userSkills.some(us => us.skill_id === skill.id);
                    return (
                      <Badge
                        key={skill.id}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSkillToggle(skill.id)}
                      >
                        {skill.name}
                        {isSelected && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
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
                      Save Changes
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

export default Profile; 