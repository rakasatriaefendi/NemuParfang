import React from 'react';
import Link from 'next/link';
import { Container } from './Container';

export const Footer = () => {
  return (
    <footer className="w-full py-16 md:py-24 bg-parfang-bg border-t border-parfang-border/50">
      <Container className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <Link href="/">
            <h3 className="font-display text-xl md:text-2xl font-bold tracking-[0.15em] uppercase text-parfang-text">
              NemuParfang
            </h3>
          </Link>
          <p className="font-body text-xs md:text-sm text-parfang-muted leading-relaxed max-w-sm">
            Skip the sniff, just click and pick! An editorial space dedicated to the art of olfaction. We guide your scent discovery through custom AI profiling and refined fragrance directories.
          </p>
        </div>

        {/* Links Column 1 */}
        <div className="md:col-span-3 md:col-start-6">
          <h4 className="font-nav text-xs uppercase tracking-widest text-parfang-text font-semibold mb-6">
            Discovery
          </h4>
          <ul className="space-y-4">
            <li>
              <Link href="/explore" className="font-body text-xs md:text-sm text-parfang-muted hover:text-parfang-accent hover:underline decoration-parfang-accent/20 transition-all">
                Fragrance Library
              </Link>
            </li>
            <li>
              <Link href="/match" className="font-body text-xs md:text-sm text-parfang-muted hover:text-parfang-accent hover:underline decoration-parfang-accent/20 transition-all">
                AI Scent Quiz
              </Link>
            </li>
            <li>
              <Link href="/mood" className="font-body text-xs md:text-sm text-parfang-muted hover:text-parfang-accent hover:underline decoration-parfang-accent/20 transition-all">
                Mood Discovery
              </Link>
            </li>
            <li>
              <Link href="/explore?occasion=Office" className="font-body text-xs md:text-sm text-parfang-muted hover:text-parfang-accent hover:underline decoration-parfang-accent/20 transition-all">
                Office Collection
              </Link>
            </li>
            <li>
              <Link href="/explore?note=Amber" className="font-body text-xs md:text-sm text-parfang-muted hover:text-parfang-accent hover:underline decoration-parfang-accent/20 transition-all">
                Amber Accords
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="md:col-span-3">
          <h4 className="font-nav text-xs uppercase tracking-widest text-parfang-text font-semibold mb-6">
            Company
          </h4>
          <ul className="space-y-4">
            <li>
              <Link href="/about" className="font-body text-xs md:text-sm text-parfang-muted hover:text-parfang-accent hover:underline decoration-parfang-accent/20 transition-all">
                About Our Vision
              </Link>
            </li>
            <li>
              <Link href="/community" className="font-body text-xs md:text-sm text-parfang-muted hover:text-parfang-accent hover:underline decoration-parfang-accent/20 transition-all">
                Community Notes
              </Link>
            </li>
            <li>
              <Link href="/about#privacy" className="font-body text-xs md:text-sm text-parfang-muted hover:text-parfang-accent hover:underline decoration-parfang-accent/20 transition-all">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/about#terms" className="font-body text-xs md:text-sm text-parfang-muted hover:text-parfang-accent hover:underline decoration-parfang-accent/20 transition-all">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      {/* Copyright */}
      <Container className="mt-16 pt-8 border-t border-parfang-border/20 text-center">
        <p className="font-body text-[10px] uppercase tracking-wider text-parfang-muted">
          &copy; {new Date().getFullYear()} NemuParfang. All Discovery Rights Reserved.
        </p>
      </Container>
    </footer>
  );
};
export default Footer;
