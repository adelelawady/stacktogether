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

type Profile = Database['public']['Tables']['profiles']['Row'];
type Skill = Database['public']['Tables']['skills']['Row'];
type UserSkill = Database['public']['Tables']['user_skills']['Row'];

interface ProfileFormData extends Omit<Profile, 'id' | 'created_at' | 'updated_at'> {}

const Profile = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: null,
    title: null,
    bio: null,
    location: null,
    avatar_url: null,
    years_of_experience: null,
    github_url: null,
    linkedin_url: null,
    twitter_url: null,
    website_url: null,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        title: profile.title,
        bio: profile.bio,
        location: profile.location,
        avatar_url: profile.avatar_url,
        years_of_experience: profile.years_of_experience,
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
        twitter_url: profile.twitter_url,
        website_url: profile.website_url,
      });
    }
  }, [profile]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
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
        description: "Failed to update skills. Please try again.",
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

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
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
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information and skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Full Stack Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
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
                    value={formData.years_of_experience}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
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
                    value={formData.github_url}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter URL</Label>
                  <Input
                    id="twitter_url"
                    name="twitter_url"
                    value={formData.twitter_url}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">Personal Website</Label>
                  <Input
                    id="website_url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
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