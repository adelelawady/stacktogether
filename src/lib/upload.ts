import { supabase } from "@/integrations/supabase/client";

export const uploadAvatar = async (file: File, userId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data: oldFiles } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (oldFiles?.length) {
      await supabase.storage
        .from('avatars')
        .remove(oldFiles.map(f => `${userId}/${f.name}`));
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}; 