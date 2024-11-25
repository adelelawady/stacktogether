import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import UserCard from "@/components/UserCard";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Skill = Database['public']['Tables']['skills']['Row'];

interface ProfileWithSkills extends Profile {
  user_skills: {
    skills: Skill;
  }[];
}

const Index = () => {
  const [users, setUsers] = useState<ProfileWithSkills[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_skills (
            skills (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log("Searching for:", query);
  };

  const handleConnect = (userId: string) => {
    // TODO: Implement connect functionality
    console.log("Connecting with user:", userId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Connect with Amazing Developers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover talented developers, explore their tech stacks, and build meaningful
            professional connections.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard
              key={user.id}
              {...user}
              skills={user.user_skills.map(us => us.skills)}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;