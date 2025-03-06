export interface Media {
  id: string;
  bucket_name: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
