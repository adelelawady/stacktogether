import { Heart, Github, Linkedin, Twitter, MapPin, Calendar, Globe, Briefcase } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getAvatarUrl } from "@/lib/avatar";
import { AvatarStyle } from "@/lib/avatar";

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
  categories: string[] | null;
  onConnect?: (userId: string) => void;
  avatar_style?: AvatarStyle;
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
  categories,
  onConnect,
  avatar_style = 'lorelei',
}: UserCardProps) => {
  const socialLinks = [
    { url: github_url, icon: Github, label: "GitHub", platform: 'github' },
    { url: linkedin_url, icon: Linkedin, label: "LinkedIn", platform: 'linkedin' },
    { url: twitter_url, icon: Twitter, label: "Twitter", platform: 'twitter' },
    { url: website_url, icon: Globe, label: "Website", platform: 'website' },
  ].filter(link => link.url);

  const displayName = full_name || "Anonymous User";
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider>
      <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={ getAvatarUrl(displayName, avatar_style)} 
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="text-lg bg-primary/10">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-grow min-h-[80px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{displayName}</h3>
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
            <div className="flex flex-col gap-1 mt-2">
              {location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4 shrink-0" />
                <span className="truncate">
                  Joined {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow space-y-4">
          {bio ? (
            <p className="text-sm text-gray-600 line-clamp-3">
              {bio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No bio provided
            </p>
          )}
           {/* 
          {categories  && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="capitalize">
                  {category}
                </Badge>
              ))}
            </div>
          )}
           */}
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No skills listed
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between mt-auto pt-6 border-t">
          <div className="flex space-x-2">
            {socialLinks.length > 0 ? (
              socialLinks.map(({ url, icon: Icon, label, platform }) => (
                <Tooltip key={`${platform}-${url}`}>
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic py-2">
                No social links
              </p>
            )}
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