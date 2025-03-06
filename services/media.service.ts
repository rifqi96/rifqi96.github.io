import type { Media } from "@/types/Media";

export const mediaService = {
  isValidMedia(media: Media | null): boolean | string {
    if (!media) return false;
    return (
      media.id &&
      media.bucket_name &&
      media.storage_path &&
      media.file_name &&
      media.mime_type &&
      typeof media.size_bytes === "number"
    );
  },

  getPublicUrl(media: Media): string {
    const supabase = useSupabaseClient();
    const { data } = supabase.storage
      .from("media")
      .getPublicUrl(media.storage_path);

    return data.publicUrl;
  },
};
