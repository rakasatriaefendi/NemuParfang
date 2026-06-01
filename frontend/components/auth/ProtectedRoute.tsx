"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthSession } from '@/components/auth/AuthProvider';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isReady } = useAuthSession();

  useEffect(() => {
    if (!isReady || session) return;
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isReady, pathname, router, session]);

  if (!isReady) {
    return (
      <div className="min-h-[40vh] animate-pulse rounded-2xl border border-parfang-border bg-parfang-surface/60" />
    );
  }

  if (!session) return null;

  return <>{children}</>;
};
