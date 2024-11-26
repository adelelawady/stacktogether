import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users } from "lucide-react";
import UserCard from "@/components/UserCard";
import { Skeleton } from "@/components/ui/skeleton";

type Category = Database['public']['Tables']['categories']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Skill = Database['public']['Tables']['skills']['Row'];

interface ProfileWithSkills extends Profile {
  user_skills: {
    skills: Skill;
  }[];
}

const Categories = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<ProfileWithSkills[]>([]);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const selectedCategory = searchParams.get('filter');

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // If category is selected, fetch users for that category
      if (selectedCategory) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_skills (
              skills (*)
            )
          `)
          .contains('categories', [selectedCategory])
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        setUsers(usersData || []);
      }

      // Fetch user counts for each category
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('categories');

      const counts: Record<string, number> = {};
      profilesData?.forEach(profile => {
        profile.categories?.forEach(category => {
          counts[category] = (counts[category] || 0) + 1;
        });
      });
      setUserCounts(counts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {selectedCategory.replace('_', ' ')} Developers
            </h1>
            <Button variant="outline" onClick={() => navigate("/categories")}>
              All Categories
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                {...user}
                skills={user.user_skills.map(us => us.skills)}
                onConnect={(userId) => console.log("Connect:", userId)}
              />
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                No developers found in this category.
              </p>
            </div>
          )}
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
            Developer Categories
          </h1>
          <Button onClick={() => navigate("/all-users")}>
            View All Developers
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/categories?filter=${category.name}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold capitalize">
                  {category.name.replace('_', ' ')}
                </h2>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    {userCounts[category.name] || 0} developer{userCounts[category.name] !== 1 ? 's' : ''}
                  </span>
                </div>
                {category.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {category.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Categories; 