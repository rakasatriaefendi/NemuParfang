import Link from 'next/link';
import { ArrowRight, Shield, Sparkles, Users, Wand2 } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { ImageWithSkeleton } from '@/components/shared/ImageWithSkeleton';
import { Button } from '@/components/ui/Button';

const pillars = [
  {
    title: 'Calmer discovery',
    description:
      'NemuParfang is built to help people narrow thousands of fragrances into a smaller, more wearable set of options.',
    icon: Sparkles,
  },
  {
    title: 'Personal memory',
    description:
      'Favorites, wardrobe, reviews, and public profiles let users keep a personal trail of what they wore, loved, and want to revisit.',
    icon: Users,
  },
  {
    title: 'Layered recommendation',
    description:
      'The current product combines strong catalog data, rule-based scent similarity, and a separate ML service for deeper AI matching.',
    icon: Wand2,
  },
];

const privacyPrinciples = [
  'Public profiles are opt-in, not public by default.',
  'Wardrobe stays private even when a user shares favorites or reviews.',
  'Community uploads are limited to static JPG and PNG images in this MVP.',
];

export default function AboutPage() {
  return (
    <div className="bg-parfang-bg pb-24">
      <Container className="grid gap-10 border-b border-parfang-border py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="font-handwrite text-3xl text-parfang-accent">About NemuParfang</p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-parfang-text md:text-6xl">
            A fragrance discovery space that stays useful before it gets loud.
          </h1>
          <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-parfang-muted">
            NemuParfang started as a way to make scent discovery feel less random. Instead of dropping users into an
            endless catalog, the product pairs a structured perfume library with personal collections, community notes,
            and recommendation systems that can grow from rule-based logic into richer AI matching.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore">
              <Button>
                Explore the library
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/match">
              <Button variant="secondary">Start AI quiz</Button>
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-parfang-border bg-parfang-surface shadow-sm">
          <div className="relative aspect-[4/5] w-full">
            <ImageWithSkeleton
              src="/assets/about-brand-story.webp"
              alt="Editorial still life introducing the NemuParfang brand story"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              skeletonClassName="bg-[linear-gradient(135deg,#ede4d8_0%,#faf7f3_45%,#d6c6b2_100%)]"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent p-8 text-white">
            <p className="font-nav text-[11px] uppercase tracking-[0.2em] text-parfang-accent-light">Built for scent journaling</p>
            <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-white/90">
              The goal is simple: help people recognize patterns in what they love, not just chase hype bottles one by one.
            </p>
          </div>
        </div>
      </Container>

      <Container className="py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-3xl border border-parfang-border bg-parfang-surface p-7">
              <div className="inline-flex rounded-full border border-parfang-border bg-parfang-bg p-3 text-parfang-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-3xl text-parfang-text">{title}</h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-parfang-muted">{description}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="grid gap-8 border-t border-parfang-border py-14 lg:grid-cols-[1fr_1fr]">
        <section>
          <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent">How it works</span>
          <h2 className="mt-4 font-display text-4xl text-parfang-text">One product, three layers</h2>
          <div className="mt-6 space-y-4 font-body text-sm leading-relaxed text-parfang-muted">
            <p>
              <strong className="text-parfang-text">Catalog layer:</strong> the frontend browses a large Supabase-backed
              perfume dataset with accords, note pyramids, community reviews, and image URLs.
            </p>
            <p>
              <strong className="text-parfang-text">Personal layer:</strong> users can save favorites, manage a wardrobe,
              write reviews, and optionally publish a profile for discovery in the community feed.
            </p>
            <p>
              <strong className="text-parfang-text">AI layer:</strong> a separate FastAPI service serves the matching
              pipeline for quiz-based recommendations, while rule-based recommendations keep the product useful even when
              the ML path is not the only decision engine.
            </p>
          </div>
        </section>

        <section id="privacy" className="rounded-3xl border border-parfang-border bg-parfang-surface p-7">
          <div className="inline-flex rounded-full border border-parfang-border bg-parfang-bg p-3 text-parfang-accent">
            <Shield className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-4xl text-parfang-text">Privacy and sharing</h2>
          <ul className="mt-6 space-y-3 font-body text-sm leading-relaxed text-parfang-muted">
            {privacyPrinciples.map((principle) => (
              <li key={principle} className="rounded-2xl border border-parfang-border bg-parfang-bg px-4 py-4">
                {principle}
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <Container className="border-t border-parfang-border py-14">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section id="terms" className="rounded-3xl border border-parfang-border bg-parfang-surface p-7">
            <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent">Terms</span>
            <h2 className="mt-4 font-display text-4xl text-parfang-text">MVP ground rules</h2>
            <div className="mt-5 space-y-4 font-body text-sm leading-relaxed text-parfang-muted">
              <p>Community posts are meant for scent discussion, bottle shots, short notes, and review-style sharing.</p>
              <p>Static image uploads are supported in the current build. Video, GIF, explicit NSFW, and blocked SARA language are not.</p>
              <p>Recommendation results should be treated as guidance for exploration, not absolute guarantees of personal taste or wear performance.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-parfang-border bg-parfang-surface p-7">
            <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent">Roadmap position</span>
            <h2 className="mt-4 font-display text-4xl text-parfang-text">Where the project stands now</h2>
            <div className="mt-5 space-y-4 font-body text-sm leading-relaxed text-parfang-muted">
              <p>
                The product already covers browsing, filtering, saving, wardrobe management, reviews, public profiles,
                community exchange, and rule-based recommendations.
              </p>
              <p>
                The next layer is deeper AI and ML work: stabilizing serving paths, improving semantic retrieval, and
                making quiz-based fragrance matching more explainable and reliable in production.
              </p>
              <p>
                The intention is not to replace human taste, but to help users reach better starting points faster.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
