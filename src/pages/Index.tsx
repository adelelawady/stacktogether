import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import UserCard from "@/components/UserCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Profile {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  skills: { name: string }[];
  social_links: { platform: string; url: string }[];
}

const fetchProfiles = async (searchQuery: string = "") => {
  let query = supabase
    .from("profiles")
    .select(`
      *,
      skills:user_skills(skill:skills(name)),
      social_links(platform, url)
    `);

  if (searchQuery) {
    query = query.or(
      `full_name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,skills.skill.name.ilike.%${searchQuery}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Profile[];
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles", searchQuery],
    queryFn: () => fetchProfiles(searchQuery),
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Connect with Amazing Developers
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover talented developers, explore their tech stacks, and build meaningful
            professional connections.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles?.map((profile) => (
            <UserCard
              key={profile.id}
              name={profile.full_name || "Anonymous"}
              title="Developer" // This could be added to the profile table if needed
              avatar={profile.avatar_url || "https://api.dicebear.com/7.x/avatars/svg?seed=" + profile.id}
              bio={profile.bio || "No bio available"}
              skills={profile.skills?.map((s) => s.skill.name) || []}
              socialLinks={profile.social_links || []}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;