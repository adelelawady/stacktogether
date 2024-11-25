import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import UserCard from "@/components/UserCard";

const MOCK_USERS = [
  {
    name: "Sarah Johnson",
    title: "Full Stack Developer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    bio: "Passionate about building scalable web applications and mentoring junior developers.",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
  },
  {
    name: "Michael Chen",
    title: "Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    bio: "Creating beautiful and accessible user interfaces with modern web technologies.",
    skills: ["Vue.js", "TailwindCSS", "JavaScript", "Figma"],
  },
  {
    name: "Emily Rodriguez",
    title: "Backend Developer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    bio: "Specialized in building robust APIs and microservices architectures.",
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
  },
];

const Index = () => {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

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
          {MOCK_USERS.map((user) => (
            <UserCard key={user.name} {...user} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;