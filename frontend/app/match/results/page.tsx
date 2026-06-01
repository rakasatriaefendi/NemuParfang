"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { PerfumeCard } from '@/components/perfume/PerfumeCard';
import { Button } from '@/components/ui/Button';
import { Perfume } from '@/lib/types';

interface MatchResult { perfumes: Perfume[]; fragranceDNA: { name: string; percentage: number }[] }

export default function MatchResultsPage() {
  const [result, setResult] = useState<MatchResult | null>(null);
  useEffect(() => {
    const stored = window.sessionStorage.getItem('nemuparfang-match-result');
    if (stored) setResult(JSON.parse(stored) as MatchResult);
  }, []);
  if (!result) return <main className="flex min-h-screen items-center justify-center bg-parfang-bg px-6 text-center"><div><h1 className="font-display text-4xl">Your consultation is waiting.</h1><Link href="/match"><Button className="mt-6">Start AI Match</Button></Link></div></main>;
  const dominant = result.fragranceDNA[0];
  return (
    <main className="min-h-screen bg-parfang-bg">
      <header className="flex h-20 items-center justify-between border-b border-parfang-border px-5 md:px-12"><Link href="/" className="font-display text-xl tracking-[0.2em] uppercase">NemuParfang</Link><Link href="/match" className="font-nav text-xs uppercase tracking-[0.16em] text-parfang-muted">Retake Quiz</Link></header>
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-10">
        <h1 className="text-center font-handwrite text-5xl text-parfang-accent">Your Fragrance DNA</h1>
        <div className="mx-auto mt-12 grid max-w-4xl items-center gap-10 md:grid-cols-[260px_1fr]">
          <div className="flex aspect-square items-center justify-center rounded-lg border-8 border-parfang-accent-light bg-parfang-surface shadow-[0_15px_45px_var(--parfang-glow)]"><div className="text-center"><p className="font-nav text-[10px] uppercase tracking-[0.2em]">Dominant Accord</p><p className="mt-3 font-display text-4xl text-parfang-accent">{dominant?.name}</p><p className="font-display text-3xl text-parfang-accent-light">{dominant?.percentage}%</p></div></div>
          <div><h2 className="font-display text-3xl">A profile shaped around {dominant?.name}.</h2><p className="mt-4 font-body text-sm leading-7 text-parfang-muted">Your selections reveal a personal scent direction rather than a rigid rule. These recommendations combine accord alignment, similarity retrieval, and ranking signals to surface fragrances worth exploring.</p><div className="mt-5 flex flex-wrap gap-2">{result.fragranceDNA.map((item) => <span key={item.name} className="border border-parfang-border px-3 py-1 font-nav text-[10px] uppercase tracking-widest">{item.name} {item.percentage}%</span>)}</div></div>
        </div>
      </section>
      <section className="bg-parfang-surface py-16"><div className="mx-auto max-w-6xl px-5 md:px-10"><h2 className="font-display text-3xl">Top Matches for You</h2><p className="mt-2 font-body text-sm text-parfang-muted">Curated from your unique olfactory signature.</p><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{result.perfumes.map((perfume) => <PerfumeCard key={perfume.id} perfume={perfume} />)}</div><div className="mt-10 flex flex-wrap gap-3"><Link href="/match"><Button variant="secondary"><RotateCcw className="h-4 w-4" /> Retake</Button></Link><Link href="/profile"><Button>Save My Profile <ArrowRight className="h-4 w-4" /></Button></Link></div></div></section>
    </main>
  );
}
