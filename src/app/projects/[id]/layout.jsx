import { supabase } from '../../../lib/supabase';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const { data: project } = await supabase
      .from('projects')
      .select('name, tagline, category, images')
      .eq('id', id)
      .maybeSingle();

    if (project) {
      const description =
        project.tagline ||
        `${project.name} — an active ${project.category || 'investment'} opportunity at WOORA Group.`;
      return {
        title: project.name,
        description,
        alternates: { canonical: `/projects/${id}` },
        openGraph: {
          title: `${project.name} | WOORA Group`,
          description,
          url: `/projects/${id}`,
          ...(project.images?.[0] && { images: [project.images[0]] }),
        },
      };
    }
  } catch {
    // fall through to default
  }
  return {
    title: 'Project Details',
    alternates: { canonical: `/projects/${id}` },
  };
}

export default function ProjectDetailLayout({ children }) {
  return children;
}
