import { Heart, Github, Linkedin, Twitter, MapPin, Calendar, Globe, Briefcase } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Skill {
  id: string;
  name: string;
}

interface UserCardProps {
  id: string;
  full_name: string | null;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
  years_of_experience: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  skills: Skill[];
  onConnect?: (userId: string) => void;
}

const UserCard = ({ 
  id,
  full_name,
  title,
  bio,
  avatar_url,
  location,
  created_at,
  years_of_experience,
  github_url,
  linkedin_url,
  twitter_url,
  website_url,
  skills,
  onConnect 
}: UserCardProps) => {
  const socialLinks = [
    { url: github_url, icon: Github, label: "GitHub" },
    { url: linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: twitter_url, icon: Twitter, label: "Twitter" },
    { url: website_url, icon: Globe, label: "Website" },
  ].filter(link => link.url);

  return (
    <TooltipProvider>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar_url || ""} alt={full_name || ""} />
            <AvatarFallback>{full_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{full_name}</h3>
                {title && (
                  <p className="text-sm text-muted-foreground">{title}</p>
                )}
              </div>
              {years_of_experience !== null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="mr-1 h-4 w-4" />
                      {years_of_experience}y
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {years_of_experience} years of experience
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="mr-1 h-4 w-4" />
                {location}
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="mr-1 h-4 w-4" />
              Joined {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {bio && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {bio}
            </p>
          )}
          
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            {socialLinks.map(({ url, icon: Icon, label }) => (
              <Tooltip key={url}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(url!, '_blank')}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Save profile
              </TooltipContent>
            </Tooltip>
            <Button onClick={() => onConnect?.(id)}>
              Connect
            </Button>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default UserCard;