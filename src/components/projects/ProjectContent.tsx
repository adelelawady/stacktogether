import MDEditor from "@uiw/react-md-editor";
import { Label } from "@/components/ui/label";
import { ProjectFormData } from "@/types/project.types";

interface ProjectContentProps {
  content: string;
  onChange: (value: string | undefined) => void;
}

export const ProjectContent = ({ content, onChange }: ProjectContentProps) => {
  return (
    <div className="space-y-2">
      <Label>Project Content</Label>
      <div data-color-mode="light">
        <MDEditor
          value={content}
          onChange={(value) => onChange(value)}
          preview="edit"
          height={400}
        />
      </div>
    </div>
  );
};