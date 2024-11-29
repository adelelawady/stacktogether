import { FC } from 'react';
import MarkdownEditor from '@uiw/react-markdown-editor';
import { cn } from '@/lib/utils';

interface MDXEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  minHeight?: number;
}

export const MDXEditor: FC<MDXEditorProps> = ({ 
  value, 
  onChange, 
  readOnly = false,
  className,
  minHeight = 200
}) => {
  return (
    <div className={cn("markdown-wrapper rounded-md border", className)}>
      {readOnly ? (
        <div className="prose prose-sm max-w-none p-4">
          <MarkdownEditor.Markdown 
            source={value || 'No description provided.'} 
            className="bg-transparent"
          />
        </div>
      ) : (
        <MarkdownEditor
          value={value}
          onChange={onChange}
          visible
          height={minHeight}
          enableScroll
          className="bg-background"
          toolbars={[
            'bold', 'italic', 'strikethrough', '|',
            'heading-1', 'heading-2', 'heading-3', '|',
            'quote', 'unordered-list', 'ordered-list', '|',
            'link', 'image', 'code', 'table'
          ]}
        />
      )}
    </div>
  );
}; 