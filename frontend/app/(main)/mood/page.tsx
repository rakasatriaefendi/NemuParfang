"use client";

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { PerfumeCard } from '@/components/perfume/PerfumeCard';
import { Button } from '@/components/ui/Button';
import { getPerfumes } from '@/lib/api/perfumes';
import { Perfume } from '@/lib/types';
import { cn } from '@/lib/utils';

const moods = [{ name: 'Focused', accord: 'Woody' }, { name: 'Calm', accord: 'Musky' }, { name: 'Energetic', accord: 'Citrus' }, { name: 'Romantic', accord: 'Floral' }, { name: 'Confident', accord: 'Amber' }, { name: 'Mysterious', accord: 'Oud' }];

export default function MoodPage() {
  const [mood, setMood] = useState(moods[0]);
  const [items, setItems] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(false);
  const discover = async () => { setLoading(true); setItems((await getPerfumes({ note: mood.accord })).slice(0, 6)); setLoading(false); };
  return <div className="min-h-screen bg-parfang-bg py-16"><Container><p className="font-handwrite text-3xl text-parfang-accent">A lighter way to discover</p><h1 className="mt-2 max-w-2xl font-display text-5xl">What should your next scent feel like?</h1><p className="mt-4 max-w-xl font-body text-sm leading-6 text-parfang-muted">Choose an atmosphere. We will open a small, thoughtful path through the fragrance library.</p><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{moods.map((item) => <button key={item.name} type="button" aria-pressed={mood.name === item.name} onClick={() => setMood(item)} className={cn('min-h-24 rounded-lg border bg-parfang-surface p-5 text-left font-display text-2xl transition-all', mood.name === item.name ? 'border-parfang-accent shadow-[0_12px_35px_var(--parfang-glow)]' : 'border-parfang-border hover:border-parfang-accent-light')}>{item.name}<span className="mt-2 block font-nav text-[10px] uppercase tracking-widest text-parfang-muted">{item.accord} direction</span></button>)}</div><Button className="mt-8" onClick={discover} disabled={loading}>{loading ? 'Curating...' : 'Discover This Mood'} <Sparkles className="h-4 w-4" /></Button>{items.length > 0 && <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <PerfumeCard key={item.id} perfume={item} showMatchScore={false} />)}</div>}</Container></div>;
}
