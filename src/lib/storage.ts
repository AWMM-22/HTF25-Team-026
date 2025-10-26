import { supabase } from './supabaseClient';

const BUCKET = (import.meta as any).env?.VITE_SUPABASE_STORAGE_BUCKET || 'public';

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadMedia(files: File[], folder: string) {
  const results: string[] = [];
  for (const file of files.slice(0, 3)) {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    try {
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        const msg = `Storage upload failed: ${error.message}. Bucket="${BUCKET}". Ensure this bucket exists in Supabase Storage and VITE_SUPABASE_STORAGE_BUCKET is set.`;
        throw new Error(msg);
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      results.push(data.publicUrl);
    } catch (e) {
      // Fallback: embed as data URL so UI can still proceed without Storage
      const dataUrl = await readFileAsDataURL(file);
      results.push(dataUrl);
    }
  }
  return results;
}
