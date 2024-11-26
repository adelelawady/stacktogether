import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/lib/upload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAvatarUrl } from "@/lib/avatar";
import { AvatarStyle } from "@/lib/avatar";

interface AvatarUploadProps {
  userId: string;
  url: string | null;
  email?: string;
  name?: string;
  onUploadComplete: (url: string) => void;
  size?: "sm" | "md" | "lg";
  fallback: string;
  style?: AvatarStyle;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

export function AvatarUpload({ 
  userId, 
  url, 
  email,
  name,
  onUploadComplete, 
  size = "md",
  fallback,
  style = 'lorelei',
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const publicUrl = await uploadAvatar(file, userId);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const generateAvatar = async () => {
    if (!name) return;
    
    try {
      setIsLoading(true);
      const avatarUrl = await getAvatarUrl(name, style);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onUploadComplete(avatarUrl);
      toast({
        title: "Success",
        description: "Avatar generated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate avatar. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={url || ""} alt="Avatar" />
        <AvatarFallback>
          {isLoading || isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            fallback
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          onClick={generateAvatar}
          disabled={isLoading || isUploading || !name}
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isUploading}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
        disabled={isLoading || isUploading}
      />
    </div>
  );
} 