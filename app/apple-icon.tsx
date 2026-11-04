import { ImageResponse } from 'next/og';
import { Seal } from '@/components/Seal.tsx';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<Seal size={180} />, size);
}
