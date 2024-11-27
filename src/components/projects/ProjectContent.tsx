import { MDXEditor } from "@/components/ui/mdx-editor";

interface ProjectContentProps {
  content?: string;
  onChange?: (content: string) => void;
}

export function ProjectContent({ content = '', onChange }: ProjectContentProps) {
  return (
    <div className="w-full max-w-none">
      {content ? (
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <MDXEditor.Preview source={content} />
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No documentation available for this project.</p>
          <p className="text-sm mt-2">Documentation helps others understand your project better.</p>
        </div>
      )}
    </div>
  );
}