
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the supabase client directly from the integration
export const supabase = supabaseClient;

export async function uploadScreenshot(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  
  const { data, error } = await supabase
    .storage
    .from('screenshots')
    .upload(`public/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) {
    throw new Error(error.message);
  }
  
  // Get public URL for the file
  const { data: { publicUrl } } = supabase
    .storage
    .from('screenshots')
    .getPublicUrl(`public/${fileName}`);
    
  // If using database to track links
  const { data: linkData, error: linkError } = await supabase
    .from('shared_screenshots')
    .insert([
      { 
        url: publicUrl,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
    ])
    .select();
    
  if (linkError) {
    console.error('Error saving link to database:', linkError);
    // Still return the public URL even if DB insert fails
  }
  
  return publicUrl;
}
