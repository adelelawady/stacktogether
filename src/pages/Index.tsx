import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import UserCard from "@/components/UserCard";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [searchQuery, setSearchQuery] = useState("");

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
    setSearchQuery(query.toLowerCase());
  };

  const handleConnect = (userId: string) => {
    // TODO: Implement connect functionality
    console.log("Connecting with user:", userId);
  };

  // Group users by categories
  const usersByCategory = users.reduce((acc, user) => {
    if (!user.categories) return acc;
    
    user.categories.forEach(category => {
      if (!acc[category]) {
        acc[category] = [];
      }
      
      // Apply search filter
      if (searchQuery) {
        const matchesSearch = 
          user.full_name?.toLowerCase().includes(searchQuery) ||
          user.bio?.toLowerCase().includes(searchQuery) ||
          user.location?.toLowerCase().includes(searchQuery) ||
          user.title?.toLowerCase().includes(searchQuery) ||
          user.user_skills.some(us => 
            us.skills.name.toLowerCase().includes(searchQuery)
          );
        
        if (matchesSearch) {
          acc[category].push(user);
        }
      } else {
        acc[category].push(user);
      }
    });
    
    return acc;
  }, {} as Record<string, ProfileWithSkills[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-64" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

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

        <div className="flex justify-center mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="space-y-12">
          {Object.entries(usersByCategory)
            .filter(([_, users]) => users.length > 0) // Only show categories with users
            .map(([category, categoryUsers]) => (
              <section key={category} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900 capitalize">
                    {category.replace('_', ' ')}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {categoryUsers.length} developer{categoryUsers.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryUsers.map((user) => (
                    <UserCard
                      key={`${category}-${user.id}`}
                      {...user}
                      skills={user.user_skills.map(us => us.skills)}
                      onConnect={handleConnect}
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>

        {Object.keys(usersByCategory).length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              {searchQuery 
                ? "No developers found matching your search criteria."
                : "No developers available at the moment."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;