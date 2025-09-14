'use client';

import { VideoProvider } from '@/contexts/VideoContext';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <VideoProvider>{children}</VideoProvider>;
}