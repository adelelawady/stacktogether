import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectFormData, Project } from "@/types/project.types";

interface ProjectSettingsProps {
  formData: ProjectFormData;
  onVisibilityChange: (checked: boolean) => void;
  onStatusChange: (value: Project['status']) => void;
}

export const ProjectSettings = ({ formData, onVisibilityChange, onStatusChange }: ProjectSettingsProps) => {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Project Visibility</Label>
            <p className="text-sm text-muted-foreground">
              Make project visible to everyone
            </p>
          </div>
          <Switch
            checked={formData.is_public}
            onCheckedChange={onVisibilityChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Project Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => onStatusChange(value as Project['status'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};