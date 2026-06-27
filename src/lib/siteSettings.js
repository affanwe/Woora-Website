import { supabase } from './supabase';

export async function fetchSiteSettings(key, defaults) {
  try {
    const { data } = await supabase.from('metadata').select('value').eq('key', key).maybeSingle();
    if (data?.value) return data.value;
  } catch (e) {
    console.error(`Failed to fetch setting: ${key}`, e);
  }
  return defaults;
}
