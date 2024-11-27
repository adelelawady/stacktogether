import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useTheme } from 'next-themes';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const { theme } = useTheme();

  return (
    <Picker
      data={data}
      onEmojiSelect={onEmojiSelect}
      theme={theme === 'dark' ? 'dark' : 'light'}
      previewPosition="none"
      skinTonePosition="none"
    />
  );
} 