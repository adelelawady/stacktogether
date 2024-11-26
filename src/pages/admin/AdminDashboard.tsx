import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersManagement } from "./tabs/UsersManagement";
import { CategoriesManagement } from "./tabs/CategoriesManagement";
import { SkillsManagement } from "./tabs/SkillsManagement";
import { MembersManagement } from "./tabs/MembersManagement";
import { JoinRequestsManagement } from "./tabs/JoinRequestsManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ProjectsManagement } from "./tabs/ProjectsManagement";

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
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="requests">Join Requests</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
              <TabsContent value="users">
                <UsersManagement />
              </TabsContent>
              <TabsContent value="projects">
                <ProjectsManagement />
              </TabsContent>
              <TabsContent value="members">
                <MembersManagement />
              </TabsContent>
              <TabsContent value="requests">
                <JoinRequestsManagement />
              </TabsContent>
              <TabsContent value="categories">
                <CategoriesManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard; 