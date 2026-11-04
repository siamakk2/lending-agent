import { ImageResponse } from 'next/og';
import { Seal } from '@/components/Seal.tsx';

export const dynamic = 'force-static';

/** 512px raster logo for schema.org, the web app manifest and link previews. */
export function GET() {
  return new ImageResponse(<Seal size={512} />, { width: 512, height: 512 });
}

