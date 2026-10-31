import LangPage from '@/components/LangPage.tsx';
import { buildMetadata } from '@/lib/seo.ts';

export const revalidate = 3600;
export const metadata = buildMetadata('en');

export default function Home() {
  return <LangPage lang="en" />;
}
