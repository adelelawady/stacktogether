import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectFormData } from "@/types/project.types";

interface ProjectLinksProps {
  formData: ProjectFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProjectLinks = ({ formData, handleInputChange }: ProjectLinksProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="code_url">Code Repository URL</Label>
        <Input
          id="code_url"
          name="code_url"
          value={formData.code_url || ''}
          onChange={handleInputChange}
          placeholder="https://github.com/username/project"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="demo_url">Demo URL</Label>
        <Input
          id="demo_url"
          name="demo_url"
          value={formData.demo_url || ''}
          onChange={handleInputChange}
          placeholder="https://my-project.com"
        />
      </div>
    </div>
  );
};