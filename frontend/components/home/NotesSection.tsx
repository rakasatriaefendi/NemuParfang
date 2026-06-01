"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '../shared/Container';
import { SectionHeader } from '../shared/SectionHeader';

export const NotesSection = () => {
  const router = useRouter();

  const notes = [
    { name: 'Citrus', query: 'Citrus' },
    { name: 'Floral', query: 'Floral' },
    { name: 'Woody', query: 'Woody' },
    { name: 'Vanilla', query: 'Vanilla' },
    { name: 'Musky', query: 'Musk' },
    { name: 'Spicy', query: 'Spicy' },
    { name: 'Amber', query: 'Amber' },
    { name: 'Aquatic', query: 'Aquatic' },
  ];

  const handleNoteClick = (query: string) => {
    router.push(`/explore?note=${encodeURIComponent(query)}`);
  };

  return (
    <section className="mb-16 md:mb-24">
      <Container>
        <div className="text-center mb-12">
          <span className="font-label-caps text-xs text-primary mb-2 block uppercase tracking-[0.15em] font-semibold">
            Olfactory Vocabulary
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-parfang-text mb-3">
            Explore by Note
          </h2>
          <p className="font-body text-xs md:text-sm text-parfang-muted max-w-md mx-auto leading-relaxed">
            Expand your vocabulary of scent families. Choose an accord base to reveal corresponding curated recommendations.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {notes.map((note) => (
            <button
              key={note.name}
              onClick={() => handleNoteClick(note.query)}
              className="px-6 py-3.5 rounded-full border border-parfang-border bg-parfang-surface text-parfang-text font-nav text-xs uppercase tracking-wider hover:border-parfang-accent hover:text-parfang-accent shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              {note.name}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
};
export default NotesSection;
