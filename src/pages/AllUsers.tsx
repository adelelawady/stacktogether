import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import UserCard from "@/components/UserCard";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Skill = Database['public']['Tables']['skills']['Row'];

interface ProfileWithSkills extends Profile {
  user_skills: {
    skills: Skill;
  }[];
}

const AllUsers = () => {
  const [users, setUsers] = useState<ProfileWithSkills[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    return (
      user.full_name?.toLowerCase().includes(searchQuery) ||
      user.bio?.toLowerCase().includes(searchQuery) ||
      user.location?.toLowerCase().includes(searchQuery) ||
      user.title?.toLowerCase().includes(searchQuery) ||
      user.user_skills.some(us => 
        us.skills.name.toLowerCase().includes(searchQuery)
      )
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            All Developers
          </h1>
          <Button onClick={() => navigate("/categories")}>
            View by Category
          </Button>
        </div>

        <div className="flex justify-center mb-8">
          <SearchBar onSearch={(query) => setSearchQuery(query.toLowerCase())} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              {...user}
              skills={user.user_skills.map(us => us.skills)}
              onConnect={(userId) => console.log("Connect:", userId)}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
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

export default AllUsers; 