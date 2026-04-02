import type { APIRoute } from 'astro';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

const DATA_DIR = join(process.cwd(), 'data');
const SUBSCRIBERS_FILE = join(DATA_DIR, 'subscribers.json');

async function getSubscribers(): Promise<string[]> {
  try {
    const data = await readFile(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSubscribers(subscribers: string[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') || '';

  let email = '';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    email = body.email;
  } else {
    const formData = await request.formData();
    email = formData.get('email') as string;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Email invalide' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const subscribers = await getSubscribers();

  if (subscribers.includes(email.toLowerCase())) {
    return new Response(JSON.stringify({ message: 'Vous etes deja inscrit !' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  subscribers.push(email.toLowerCase());
  await saveSubscribers(subscribers);

  return new Response(JSON.stringify({ message: 'Inscription reussie !' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
