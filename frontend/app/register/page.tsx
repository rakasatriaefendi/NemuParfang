import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AuthForm } from '@/components/auth/AuthForm';

export default function RegisterPage() {
  return <main className="grid min-h-screen bg-parfang-bg lg:grid-cols-2"><div className="relative hidden overflow-hidden lg:block"><Image src="/assets/about-brand-story.png" alt="" fill className="object-cover" /><div className="absolute inset-0 bg-parfang-overlay" /><div className="absolute bottom-16 left-16 max-w-lg text-white"><p className="font-handwrite text-4xl text-parfang-accent-light">Begin your olfactory journal</p><h2 className="mt-4 font-display text-6xl">Keep the fragrances that found you.</h2></div></div><section className="flex flex-col items-center justify-center px-5 py-10"><Link href="/" className="mb-8 font-display text-xl uppercase tracking-[0.2em]">NemuParfang</Link><AuthForm mode="register" /></section></main>;
}
