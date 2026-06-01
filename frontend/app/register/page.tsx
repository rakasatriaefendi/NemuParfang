import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { ImageWithSkeleton } from '@/components/shared/ImageWithSkeleton';

export default function RegisterPage() {
  return <main className="grid min-h-screen bg-parfang-bg lg:grid-cols-2"><div className="relative hidden overflow-hidden lg:block"><ImageWithSkeleton src="/assets/about-brand-story.webp" alt="" fill sizes="50vw" className="object-cover" skeletonClassName="bg-[linear-gradient(135deg,#ece4dc_0%,#f8f4ef_45%,#d7c7b6_100%)]" /><div className="absolute inset-0 bg-parfang-overlay" /><div className="absolute bottom-16 left-16 max-w-lg text-white"><p className="font-handwrite text-4xl text-parfang-accent-light">Begin your olfactory journal</p><h2 className="mt-4 font-display text-6xl">Keep the fragrances that found you.</h2></div></div><section className="flex flex-col items-center justify-center px-5 py-10"><div className="mb-8 flex w-full max-w-md items-center justify-between gap-4"><Link href="/" className="font-display text-xl uppercase tracking-[0.2em]">NemuParfang</Link><Link href="/" className="inline-flex items-center gap-2 text-[11px] font-nav uppercase tracking-[0.18em] text-parfang-muted transition-colors hover:text-parfang-accent"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link></div><Suspense fallback={<div className="w-full max-w-md animate-pulse rounded-lg border border-parfang-border bg-parfang-surface p-10" />}><AuthForm mode="register" /></Suspense></section></main>;
}
