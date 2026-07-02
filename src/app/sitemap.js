import { siteConfig } from '../lib/seo/config';
import { supabase } from '../lib/supabase';

export const revalidate = 3600; // refresh sitemap every hour

export default async function sitemap() {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  // Public project detail pages from Supabase
  let projectRoutes = [];
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, created_at');
    projectRoutes = (projects || []).map((p) => ({
      url: `${base}/projects/${p.id}`,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    // If the fetch fails at build time, serve static routes only
  }

  return [...staticRoutes, ...projectRoutes];
}
