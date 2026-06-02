"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAiMatch } from '@/lib/api/recommendations';
import { MlMatchRequest } from '@/lib/types';
import { cn } from '@/lib/utils';

type Insight = {
  label: string;
  summary: string;
  notes?: string;
  caution?: string;
};

const steps = [
  { key: 'gender', title: 'Who is this scent for?', subtitle: 'Choose the profile that feels most natural.', options: ['unisex', 'women', 'men'] },
  { key: 'age_group', title: 'Which chapter feels like you?', subtitle: 'This gently tunes the release-year signal.', options: ['teen', 'young_adult', 'adult', 'mature'] },
  { key: 'style', title: 'What is your go-to vibe?', subtitle: 'Choose the energy you want your scent to carry.', options: ['fresh', 'sweet', 'elegant', 'bold', 'sporty'] },
  { key: 'activity', title: 'Where will it join you?', subtitle: 'A fragrance should understand the room.', options: ['office', 'date', 'casual', 'sport', 'formal'] },
  { key: 'weather', title: 'What is the atmosphere?', subtitle: 'Temperature changes how a fragrance unfolds.', options: ['hot', 'warm', 'cool', 'cold'] },
] as const;
const accordOptions = ['woody', 'fresh', 'floral', 'sweet', 'amber', 'citrus', 'musky', 'warm spicy', 'oud', 'gourmand', 'marine', 'green', 'powdery', 'aromatic'];

const pretty = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const genderInsights: Record<string, Insight> = {
  unisex: {
    label: 'Balanced profile',
    summary: 'A flexible direction that stays open to clean woods, fresh citrus, florals, or warmer blends without leaning too heavily masculine or feminine.',
  },
  women: {
    label: 'Feminine-leaning profile',
    summary: 'Useful if you want the match engine to favor compositions commonly marketed in the women’s category, including florals, soft musks, fruits, and elegant ambers.',
  },
  men: {
    label: 'Masculine-leaning profile',
    summary: 'Useful if you want the match engine to favor compositions commonly marketed in the men’s category, especially woods, aromatics, fresh spice, leather, and darker ambers.',
  },
};

const ageInsights: Record<string, Insight> = {
  teen: {
    label: 'Playful and current',
    summary: 'Leans toward brighter, trend-aware perfumes that feel expressive, fun, and easy to notice.',
    notes: 'Often fits fruity, sweet, airy floral, and lighter gourmand directions.',
    caution: 'Very mature, smoky, or heavily resinous perfumes can feel too serious or dense here.',
  },
  young_adult: {
    label: 'Explorative and modern',
    summary: 'Balances personality and wearability. Good for people exploring style while still wanting something current and versatile.',
    notes: 'Usually works well with citrus, aquatic, clean florals, soft woods, and modern amber touches.',
    caution: 'Overly youthful sweetness or very old-school heavy classics can feel misaligned.',
  },
  adult: {
    label: 'Grounded and versatile',
    summary: 'Shifts toward refined, dependable perfumes that feel polished across work, social settings, and everyday wear.',
    notes: 'Often connects with lavender, cedarwood, sandalwood, soft spice, leather, and balanced florals.',
    caution: 'If the perfume is too playful or too loud, it may read less professional and less adaptable.',
  },
  mature: {
    label: 'Deep and timeless',
    summary: 'Favors richer, more composed fragrances with gravitas, texture, and longer-lasting presence.',
    notes: 'Often aligns with amber, oud, incense, patchouli, oriental warmth, and formal classics.',
    caution: 'Very sugary or hyper-trendy scents can feel shallow against this profile.',
  },
};

const styleInsights: Record<string, Insight> = {
  fresh: {
    label: 'Clean energy',
    summary: 'Feels bright, easy, newly showered, and uplifting. Great when you want something approachable and effortless.',
    notes: 'Often built around citrus, mint, green tea, aquatic notes, cucumber, and airy woods.',
    caution: 'Very sweet or smoky perfumes can feel too heavy if your goal is freshness.',
  },
  sweet: {
    label: 'Cozy and inviting',
    summary: 'Warm, comforting, and a little addictive. Best when you want a softer, more enveloping presence.',
    notes: 'Often leans vanilla, caramel, honey, berry, candy, chocolate, and rounded amber.',
    caution: 'In hot weather, very sugary perfumes can become cloying or overwhelming quickly.',
  },
  elegant: {
    label: 'Polished and composed',
    summary: 'A refined direction that feels expensive, tidy, and confident without shouting for attention.',
    notes: 'Usually suits jasmine, white florals, iris, sandalwood, white musk, and smooth woody florals.',
    caution: 'If the fragrance is too playful or too sharp, it can break the calm luxury effect.',
  },
  bold: {
    label: 'Statement-making',
    summary: 'For strong projection, presence, and personality. Best when you want your scent noticed quickly.',
    notes: 'Often points toward oud, leather, tobacco, darker spice, dense amber, and dramatic woods.',
    caution: 'Used in quiet or warm spaces, bold perfumes can feel too loud or tiring to others.',
  },
  sporty: {
    label: 'Dynamic and crisp',
    summary: 'Built for movement, cleanliness, and a sharper kind of freshness that survives heat and activity.',
    notes: 'Frequently fits grapefruit, ginger, vetiver, ozonic tones, fresh cedar, and brisk aromatics.',
    caution: 'Very creamy, powdery, or dessert-like perfumes may feel too static for this energy.',
  },
};

const activityInsights: Record<string, Insight> = {
  office: {
    label: 'Close-range professionalism',
    summary: 'The goal is clean, competent, and non-intrusive. It should stay comfortable for you and the people near you.',
    notes: 'Usually works best with white musk, tea, iris, lavender, soft citrus, and lighter woods.',
    caution: 'If projection is too loud, the scent can distract coworkers or feel tiring indoors.',
  },
  date: {
    label: 'Intimate and memorable',
    summary: 'This direction favors warmth and closeness. The fragrance should invite someone nearer rather than fill the room.',
    notes: 'Vanilla, amber, cardamom, cherry facets, dark rose, soft musk, and cozy woods often fit well.',
    caution: 'Overly sterile or overly sharp perfumes can weaken the romantic, close-skin effect.',
  },
  casual: {
    label: 'Relaxed and flexible',
    summary: 'Made for daily life: easy to wear, friendly, and comfortable in many outfits or low-pressure situations.',
    notes: 'Citrus, fruity freshness, aquatic tones, green notes, and light florals tend to suit this well.',
    caution: 'Very formal or extremely heavy perfumes may feel overdressed for ordinary moments.',
  },
  sport: {
    label: 'Heat-tested freshness',
    summary: 'Works with sweat, motion, and body heat. It should stay clean rather than turn sharp or sour.',
    notes: 'Mint, ginger, grapefruit, cucumber, vetiver, ozonic freshness, and brisk aromatics often do well.',
    caution: 'Dense gourmands or thick ambers can become sticky, sour, or exhausting during activity.',
  },
  formal: {
    label: 'Dressed-up presence',
    summary: 'Designed for occasions where clothing, room, and atmosphere are all elevated, so the scent can carry more richness.',
    notes: 'Oud, incense, leather, saffron, dense florals, polished amber, and structured woods often shine here.',
    caution: 'If the fragrance is too casual or too airy, it may disappear in a dressed-up environment.',
  },
};

const weatherInsights: Record<string, Insight> = {
  cold: {
    label: 'Cold air slows projection',
    summary: 'Below roughly 15°C, perfume evaporates more slowly. Richer, warmer scents help the fragrance stay noticeable.',
    notes: 'Often works well with spice, vanilla, amber, incense, sandalwood, and oud.',
    caution: 'If the scent is too light, it can vanish quickly and feel flat or distant.',
  },
  cool: {
    label: 'A flexible transition zone',
    summary: 'Around 15–20°C, you can still wear warmth, but it does not need to be dense. Balance usually wins here.',
    notes: 'Tea, soft musk, moderate florals, sweet fruits, and smooth woods are usually comfortable choices.',
    caution: 'Very icy freshness may feel thin, while heavy resins can start to feel excessive.',
  },
  warm: {
    label: 'Warm air amplifies scent',
    summary: 'Around 21–26°C, perfume projects more easily. Fresh, breathable structures tend to feel better and stay cleaner.',
    notes: 'Citrus, green notes, white florals, marine tones, and lighter woods often perform well.',
    caution: 'Dense sweet or smoky perfumes can feel stuffy, overly thick, or headache-inducing.',
  },
  hot: {
    label: 'Heat accelerates evaporation',
    summary: 'Above roughly 27°C, strong perfumes can bloom very fast. The safest path is cool, light, and refreshing.',
    notes: 'Marine, mint, cucumber, tropical freshness, airy citrus, and ozonic profiles are often best.',
    caution: 'Overly sweet or resin-heavy perfumes can become cloying, sharp, and hard to escape.',
  },
};

const accordInsights: Record<string, Insight> = {
  woody: { label: 'Dry woods', summary: 'Think cedar, sandalwood, or pencil shavings: grounded, mature, and quietly authoritative.' },
  fresh: { label: 'Clean freshness', summary: 'A broad fresh profile that feels airy, clean, and easy for beginners to wear.' },
  floral: { label: 'Blooming florals', summary: 'Rose, jasmine, lily, or garden petals: soft, romantic, and elegant.' },
  sweet: { label: 'Fruit or syrup sweetness', summary: 'Juicier and friendlier than deep gourmand; often feels cheerful and inviting.' },
  amber: { label: 'Warm resin glow', summary: 'Resinous, sensual, and long-lasting with a rich warmth that clings to skin.' },
  citrus: { label: 'Bright citrus peel', summary: 'Lemon, bergamot, lime, and orange: sharp freshness that cools and energizes quickly.' },
  musky: { label: 'Clean skin musk', summary: 'Soft, intimate, and skin-close. Often reads comforting rather than loud.' },
  'warm spicy': { label: 'Spiced warmth', summary: 'Cardamom, cinnamon, clove, or nutmeg: sexy warmth with evening-friendly depth.' },
  oud: { label: 'Dense agarwood', summary: 'Dark, smoky, expensive-feeling, and dominant. Usually a stronger statement accord.' },
  gourmand: { label: 'Edible sweetness', summary: 'Vanilla, caramel, coffee, or chocolate. Cozy, addictive, and dessert-like.' },
  marine: { label: 'Aquatic breeze', summary: 'Sea air, salt, and watery freshness that feels casual, cool, and holiday-like.' },
  green: { label: 'Leaves and stems', summary: 'Fresh-cut grass, crushed leaves, and forest humidity. Natural and calming.' },
  powdery: { label: 'Soft cosmetic powder', summary: 'Clean, nostalgic, and gentle, often with iris or vintage makeup softness.' },
  aromatic: { label: 'Fresh herbs', summary: 'Lavender, sage, rosemary, and mint. Often classic, barbershop-clean, and crisp.' },
};

export default function MatchPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<MlMatchRequest>({ age_group: 'young_adult', activity: 'casual', weather: 'warm', style: 'elegant', preferred_accords: [], gender: 'unisex', top_k: 5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isAccords = step === steps.length;
  const canContinue = isAccords ? answers.preferred_accords.length > 0 : true;
  const currentStep = !isAccords ? steps[step] : null;
  const currentValue = currentStep ? answers[currentStep.key] : null;

  const activeInsight = (() => {
    if (isAccords) {
      const selectedAccord = answers.preferred_accords[answers.preferred_accords.length - 1];
      return selectedAccord ? accordInsights[selectedAccord] : null;
    }

    if (!currentStep || typeof currentValue !== 'string') return null;

    if (currentStep.key === 'gender') return genderInsights[currentValue];
    if (currentStep.key === 'age_group') return ageInsights[currentValue];
    if (currentStep.key === 'style') return styleInsights[currentValue];
    if (currentStep.key === 'activity') return activityInsights[currentValue];
    if (currentStep.key === 'weather') return weatherInsights[currentValue];
    return null;
  })();

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
          {activeInsight && (
            <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-parfang-border bg-parfang-surface/90 p-6 text-left shadow-sm">
              <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <p className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent">
                    {activeInsight.label}
                  </p>
                  <p className="mt-3 font-body text-sm leading-relaxed text-parfang-text md:text-[15px]">
                    {activeInsight.summary}
                  </p>
                </div>
                <div className="space-y-3">
                  {activeInsight.notes && (
                    <div className="rounded-2xl border border-parfang-border bg-parfang-bg px-4 py-4">
                      <p className="font-nav text-[10px] uppercase tracking-[0.16em] text-parfang-muted">Usually fits</p>
                      <p className="mt-2 font-body text-sm leading-relaxed text-parfang-text">{activeInsight.notes}</p>
                    </div>
                  )}
                  {activeInsight.caution && (
                    <div className="rounded-2xl border border-parfang-border bg-parfang-bg px-4 py-4">
                      <p className="font-nav text-[10px] uppercase tracking-[0.16em] text-parfang-muted">Watch out</p>
                      <p className="mt-2 font-body text-sm leading-relaxed text-parfang-text">{activeInsight.caution}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {isAccords && answers.preferred_accords.length > 0 && (
            <p className="mx-auto mt-4 max-w-2xl font-body text-xs leading-relaxed text-parfang-muted md:text-sm">
              Your selected accords act like anchors for the match engine. You do not need many; two to five strong signals usually work better than choosing everything.
            </p>
          )}
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
