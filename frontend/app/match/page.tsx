"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAiMatch } from '@/lib/api/recommendations';
import { MlMatchRequest } from '@/lib/types';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'gender', title: 'Who is this scent for?', subtitle: 'Choose the profile that feels most natural.', options: ['unisex', 'women', 'men'] },
  { key: 'age_group', title: 'Which chapter feels like you?', subtitle: 'This gently tunes the release-year signal.', options: ['teen', 'young_adult', 'adult', 'mature'] },
  { key: 'style', title: 'What is your go-to vibe?', subtitle: 'Choose the energy you want your scent to carry.', options: ['fresh', 'sweet', 'elegant', 'bold', 'sporty'] },
  { key: 'activity', title: 'Where will it join you?', subtitle: 'A fragrance should understand the room.', options: ['office', 'date', 'casual', 'sport', 'formal'] },
  { key: 'weather', title: 'What is the atmosphere?', subtitle: 'Temperature changes how a fragrance unfolds.', options: ['hot', 'warm', 'cool', 'cold'] },
] as const;
const accordOptions = ['woody', 'fresh', 'floral', 'sweet', 'amber', 'citrus', 'musky', 'warm spicy', 'oud', 'gourmand', 'marine', 'green', 'powdery', 'aromatic'];

const pretty = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function MatchPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<MlMatchRequest>({ age_group: 'young_adult', activity: 'casual', weather: 'warm', style: 'elegant', preferred_accords: [], gender: 'unisex', top_k: 5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isAccords = step === steps.length;
  const canContinue = isAccords ? answers.preferred_accords.length > 0 : true;

  const toggleAccord = (accord: string) => setAnswers((current) => ({
    ...current,
    preferred_accords: current.preferred_accords.includes(accord)
      ? current.preferred_accords.filter((item) => item !== accord)
      : current.preferred_accords.length < 5 ? [...current.preferred_accords, accord] : current.preferred_accords,
  }));

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAiMatch(answers);
      window.sessionStorage.setItem('nemuparfang-match-result', JSON.stringify(result));
      router.push('/match/results');
    } catch {
      setError('AI consultant belum dapat dihubungi. Pastikan FastAPI Space sudah aktif lalu coba lagi.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-parfang-bg text-parfang-text">
      <header className="flex h-20 items-center justify-between border-b border-parfang-border px-5 md:px-12">
        <Link href="/" className="font-display text-xl tracking-[0.2em] uppercase">NemuParfang</Link>
        <Link href="/" className="font-nav text-xs uppercase tracking-[0.18em] text-parfang-muted hover:text-parfang-accent">Exit Quiz</Link>
      </header>
      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col px-5 py-10 md:px-10 md:py-14">
        <div className="mb-12">
          <div className="mb-3 flex justify-between font-nav text-[11px] uppercase tracking-[0.16em] text-parfang-muted"><span>Private Consultation</span><span>Step {step + 1} of {steps.length + 1}</span></div>
          <div className="h-1 overflow-hidden rounded-full bg-parfang-border"><div className="h-full bg-parfang-accent transition-all duration-500" style={{ width: `${((step + 1) / (steps.length + 1)) * 100}%` }} /></div>
        </div>
        <div className="mx-auto w-full max-w-5xl flex-1 text-center">
          <p className="font-handwrite text-3xl text-parfang-accent">{String(step + 1).padStart(2, '0')} / 0{steps.length + 1}</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">{isAccords ? 'Which notes pull you closer?' : steps[step].title}</h1>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm text-parfang-muted md:text-base">{isAccords ? 'Select up to five accords. A small constellation is enough.' : steps[step].subtitle}</p>
          <div className={cn('mx-auto mt-10 grid gap-4 text-left', isAccords ? 'grid-cols-2 md:grid-cols-4' : 'max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
            {(isAccords ? accordOptions : [...steps[step].options]).map((option) => {
              const selected = isAccords ? answers.preferred_accords.includes(option) : answers[steps[step].key] === option;
              return (
                <button key={option} type="button" aria-pressed={selected} onClick={() => isAccords ? toggleAccord(option) : setAnswers((current) => ({ ...current, [steps[step].key]: option }))}
                  className={cn('relative min-h-24 rounded-lg border bg-parfang-surface p-5 font-nav text-xs uppercase tracking-[0.15em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-parfang-accent', selected ? 'border-parfang-accent shadow-[0_12px_35px_var(--parfang-glow)] text-parfang-accent' : 'border-parfang-border hover:border-parfang-accent-light')}>
                  {selected && <Check className="absolute right-4 top-4 h-4 w-4" />}
                  {pretty(option)}
                </button>
              );
            })}
          </div>
          {error && <p className="mt-6 font-body text-sm text-red-700">{error}</p>}
        </div>
        <footer className="mt-10 flex items-center justify-between border-t border-parfang-border pt-6">
          <Button variant="ghost" disabled={step === 0 || loading} onClick={() => setStep((value) => value - 1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
          {isAccords ? <Button disabled={!canContinue || loading} onClick={submit}>{loading ? 'Curating...' : 'Reveal My DNA'} <Sparkles className="h-4 w-4" /></Button> : <Button onClick={() => setStep((value) => value + 1)}>Next <ArrowRight className="h-4 w-4" /></Button>}
        </footer>
      </section>
    </main>
  );
}
