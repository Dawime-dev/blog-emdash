export const prerender = true;

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const tutoriels = await getCollection('tutoriels');
  const guides = await getCollection('guides');
  const articles = await getCollection('articles');
  const themes = await getCollection('themes');
  const plugins = await getCollection('plugins');
  const dossiers = await getCollection('dossiers');

  const allContent = [
    ...tutoriels.map((p) => ({ ...p, section: 'tutoriels' })),
    ...guides.map((p) => ({ ...p, section: 'guides' })),
    ...articles.map((p) => ({ ...p, section: 'articles' })),
    ...themes.map((p) => ({ ...p, section: 'themes' })),
    ...plugins.map((p) => ({ ...p, section: 'plugins' })),
    ...dossiers.map((p) => ({ ...p, section: 'dossiers' })),
  ].sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'EmDash FR — Blog communautaire',
    description: 'Tutoriels, guides, articles et ressources en francais pour maitriser EmDash, le CMS open-source de Cloudflare.',
    site: context.site!,
    items: allContent.map((item) => ({
      title: item.data.title,
      description: item.data.description,
      pubDate: new Date(item.data.date),
      link: `/${item.section}/${item.id}`,
    })),
    customData: '<language>fr-FR</language>',
  });
}
