import type { Media } from "@/types/Media";
import { useSupabaseClient } from "@/composables/useSupabaseClient";

export interface MediaUploadOptions {
  file: File;
  folder: string;
}

export const mediaService = {
  async upload({ file, folder }: MediaUploadOptions): Promise<Media> {
    const supabase = useSupabaseClient();

    // Upload file to storage
    const filePath = `${folder}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Create media record
    const { data: media, error: insertError } = await supabase
      .from("media")
      .insert({
        bucket_name: "media",
        storage_path: filePath,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select()
      .single();

    if (insertError) {
      // Cleanup uploaded file if record creation fails
      await supabase.storage.from("media").remove([filePath]);
      throw insertError;
    }

    return media;
  },

  async delete(mediaId: string): Promise<void> {
    const supabase = useSupabaseClient();

    // Get media record first to get the storage path
    const { data: media, error: fetchError } = await supabase
      .from("media")
      .select("storage_path")
      .eq("id", mediaId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Delete from storage first
    const { error: removeError } = await supabase.storage
      .from("media")
      .remove([media.storage_path]);

    if (removeError) {
      throw removeError;
    }

    // The database record will be automatically deleted by the trigger
  },

  getPublicUrl(media: Media): string {
    console.log("Getting public URL for media:", media);
    const supabase = useSupabaseClient();
    const { data } = supabase.storage
      .from("media")
      .getPublicUrl(media.storage_path);

    console.log("Public URL:", data.publicUrl);
    return data.publicUrl;
  },
};
