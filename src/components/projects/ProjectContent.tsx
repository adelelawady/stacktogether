import { FC } from 'react';
import { MDXEditor } from '@/components/ui/mdx-editor';

interface ProjectContentProps {
  content: string;
}

export const ProjectContent: FC<ProjectContentProps> = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <MDXEditor 
        value={content || ''} 
        readOnly 
        className="min-h-[calc(100vh-20rem)]"
      />
    </div>
  );
};