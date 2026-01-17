import { redirect } from 'next/navigation';

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams || {})) {
    if (Array.isArray(v)) {
      for (const x of v) qs.append(k, x);
    } else if (typeof v === 'string') {
      qs.set(k, v);
    }
  }
  const query = qs.toString();
  redirect(query ? `/site/index.html?${query}` : '/site/index.html');
}
