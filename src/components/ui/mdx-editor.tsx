import { FC } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

interface MDXEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const MDXEditor: FC<MDXEditorProps> & {
  Preview: typeof MDEditor.Markdown;
} = ({ value, onChange, placeholder }) => {
  return (
    <MDEditor
      value={value}
      onChange={(val) => onChange?.(val || '')}
      placeholder={placeholder}
      previewOptions={{
        rehypePlugins: [[rehypeSanitize]],
      }}
      height={400}
    />
  );
};

MDXEditor.Preview = MDEditor.Markdown; 