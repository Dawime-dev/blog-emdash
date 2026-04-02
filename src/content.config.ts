import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tutoriels = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tutoriels' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Équipe EmDash FR'),
    category: z.string(),
    tags: z.array(z.string()),
    difficulty: z.enum(['debutant', 'intermediaire', 'avance']),
    duration: z.string(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Équipe EmDash FR'),
    category: z.string(),
    tags: z.array(z.string()),
    difficulty: z.enum(['debutant', 'intermediaire', 'avance']),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Équipe EmDash FR'),
    category: z.string(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const themes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/themes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Équipe EmDash FR'),
    tags: z.array(z.string()),
    themeName: z.string(),
    themeVersion: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const plugins = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/plugins' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Équipe EmDash FR'),
    tags: z.array(z.string()),
    pluginName: z.string(),
    pluginVersion: z.string().optional(),
    pluginType: z.enum(['standard', 'native']),
    rating: z.number().min(1).max(5).optional(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const dossiers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/dossiers' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Équipe EmDash FR'),
    category: z.string(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { tutoriels, guides, articles, themes, plugins, dossiers };
