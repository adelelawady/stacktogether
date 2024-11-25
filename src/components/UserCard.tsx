import { Heart, Github, Linkedin, Twitter } from "lucide-react";

interface UserCardProps {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  skills: string[];
}

const UserCard = ({ name, title, avatar, bio, skills }: UserCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-gray-600">{title}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-red-500 transition-colors">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      
      <p className="mt-4 text-gray-700 line-clamp-2">{bio}</p>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 rounded-full bg-accent/20 text-sm text-secondary"
          >
            {skill}
          </span>
        ))}
      </div>
      
      <div className="mt-6 flex items-center space-x-4 text-gray-400">
        <a href="#" className="hover:text-primary transition-colors">
          <Github className="h-5 w-5" />
        </a>
        <a href="#" className="hover:text-primary transition-colors">
          <Linkedin className="h-5 w-5" />
        </a>
        <a href="#" className="hover:text-primary transition-colors">
          <Twitter className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};

export default UserCard;