import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectFormData } from "@/types/project.types";

interface ProjectBasicInfoProps {
  formData: ProjectFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProjectBasicInfo = ({ formData, handleInputChange }: ProjectBasicInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="My Awesome Project"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          placeholder="A brief description of your project"
        />
      </div>
    </>
  );
};