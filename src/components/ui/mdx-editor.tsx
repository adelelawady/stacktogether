import { FC } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

interface MDXEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  minHeight?: number;
}

export const MDXEditor: FC<MDXEditorProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  readOnly = false,
  className,
  minHeight = 200
}) => {
  return (
    <div className={cn("markdown-body", className)} data-color-mode="light">
      {readOnly ? (
        <div className="prose prose-sm max-w-none">
          <MDEditor.Markdown 
            source={value || placeholder} 
            rehypePlugins={[[rehypeSanitize]]}
            className="bg-transparent px-0"
          />
        </div>
      ) : (
        <MDEditor
          value={value}
          onChange={(val) => onChange?.(val || '')}
          preview="live"
          placeholder={placeholder}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
          className="border rounded-md bg-background"
          height={minHeight}
          hideToolbar={false}
          toolbarHeight={50}
          visibleDragbar={false}
        />
      )}
    </div>
  );
}; 