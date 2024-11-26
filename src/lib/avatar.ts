export type AvatarStyle = 'lorelei' | 'bottts' | 'pixel-art' | 'avataaars' | 'big-ears' | 'adventurer';

export const getAvatarUrl = (name: string, style: AvatarStyle = 'lorelei') => {
  // Clean and encode the name for URL
  const seed = encodeURIComponent(name.toLowerCase().trim());
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}; 