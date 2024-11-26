import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersManagement } from "./tabs/UsersManagement";
import { CategoriesManagement } from "./tabs/CategoriesManagement";
import { SkillsManagement } from "./tabs/SkillsManagement";
import { MembersManagement } from "./tabs/MembersManagement";
import { JoinRequestsManagement } from "./tabs/JoinRequestsManagement";
import { ProjectsManagement } from "./tabs/ProjectsManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Users, Grid, Settings, UserPlus, FolderKanban, Wrench } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const tabs = [
  { id: "users", label: "Users", icon: Users },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "members", label: "Members", icon: UserPlus },
  { id: "requests", label: "Requests", icon: Settings },
  { id: "categories", label: "Categories", icon: Grid },
  { id: "skills", label: "Skills", icon: Wrench },
];

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  // Redirect if not admin
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="inline-flex h-14 items-center justify-start gap-4 p-4">
                    {tabs.map(({ id, label, icon: Icon }) => (
                      <TabsTrigger
                        key={id}
                        value={id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>
              </div>
              <div className="p-4">
                <TabsContent value="users" className="m-0">
                  <UsersManagement />
                </TabsContent>
                <TabsContent value="projects" className="m-0">
                  <ProjectsManagement />
                </TabsContent>
                <TabsContent value="members" className="m-0">
                  <MembersManagement />
                </TabsContent>
                <TabsContent value="requests" className="m-0">
                  <JoinRequestsManagement />
                </TabsContent>
                <TabsContent value="categories" className="m-0">
                  <CategoriesManagement />
                </TabsContent>
                <TabsContent value="skills" className="m-0">
                  <SkillsManagement />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard; 