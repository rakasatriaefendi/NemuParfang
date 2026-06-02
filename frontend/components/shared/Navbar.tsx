"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from './Container';
import { Search, User, Heart, Sparkles, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthSession } from '@/components/auth/AuthProvider';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session, profile } = useAuthSession();
  const displayName = profile?.display_name || session?.user.displayName || session?.user.email.split('@')[0];
  const hideGlobalSearch = pathname === '/explore' || pathname === '/community';

  // Monitor scroll behavior to trigger compact header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Explore', href: '/explore', hasMegaMenu: true },
    { name: 'AI Match', href: '/match', icon: <Sparkles className="w-3.5 h-3.5 text-parfang-accent" /> },
    { name: 'Mood', href: '/mood', icon: <Wind className="w-3.5 h-3.5 text-parfang-accent" /> },
    { name: 'About', href: '#' },
    { name: 'Community', href: '/community' },
  ];

  const megaMenuCategories = [
    { name: 'Woody', desc: 'Sandalwood, Cedar, Oud', img: '/assets/occasion-office.webp', href: '/explore?note=Woody' },
    { name: 'Fresh', desc: 'Bergamot, Neroli, Mint', img: '/assets/occasion-casual.webp', href: '/explore?note=Citrus' },
    { name: 'Floral', desc: 'Damask Rose, Jasmine', img: '/assets/occasion-date-night.webp', href: '/explore?note=Floral' },
    { name: 'Oriental', desc: 'Vanilla, Amber, Spices', img: '/assets/weather-cool-night.webp', href: '/explore?note=Amber' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500 ease-in-out border-b',
        isScrolled
          ? 'bg-parfang-surface/90 backdrop-blur-md shadow-md py-3 border-parfang-border/50'
          : 'bg-parfang-bg border-transparent py-0'
      )}
    >
      {/* 1. Thin Top Bar */}
      <motion.div
        initial={false}
        animate={isScrolled ? { height: 0, opacity: 0, y: -6 } : { height: 33, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="hidden overflow-hidden border-b border-white/5 bg-[#1C1B1A] text-[#FBFBFA] md:block"
        style={{ willChange: 'height, opacity, transform' }}
      >
        <Container className="flex h-8 items-center justify-between text-[11px] font-nav uppercase tracking-widest">
          <div>Skip the sniff, just click and pick!</div>
          <div className="flex gap-6 items-center">
            {session ? (
              <>
                <Link href="/favorites" className="hover:text-parfang-accent transition-colors flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Favorites
                </Link>
                <span>|</span>
                <Link href="/wardrobe" className="hover:text-parfang-accent transition-colors">
                  My Wardrobe
                </Link>
                <span>|</span>
                <Link href="/profile" className="hover:text-parfang-accent transition-colors">
                  {displayName}
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="hover:text-parfang-accent transition-colors">
                  Register
                </Link>
                <span>|</span>
                <Link href="/login" className="hover:text-parfang-accent transition-colors">
                  Login
                </Link>
              </>
            )}
          </div>
        </Container>
      </motion.div>

      {/* 2. Middle Layer (Logo & Search) - Condensed on scroll */}
      <Container className="relative">
        <div className="flex justify-between items-center h-20">
          
          {/* Search bar (Left aligned when not scrolled, disappears on scroll/moves) */}
          <div className="hidden md:flex items-center w-1/4">
            {!hideGlobalSearch && (
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[240px]">
                <input
                  type="text"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-parfang-surface border border-parfang-border/80 px-4 py-2 pl-9 rounded-full text-xs font-body text-parfang-text focus:outline-none focus:border-parfang-accent transition-colors"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-parfang-muted" />
              </form>
            )}
          </div>

          {/* Centered Brand Logo */}
          <div className="flex-1 md:flex-none text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link href="/" className="inline-block group">
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase text-parfang-text group-hover:text-parfang-accent transition-colors duration-300">
                NemuParfang
              </h1>
            </Link>
          </div>

          {/* Right Action Trigger (CTA & Profile) */}
          <div className="w-1/4 flex justify-end items-center gap-4">
            <Link href="/match" className="hidden lg:flex items-center gap-2 bg-parfang-accent text-white px-6 py-2.5 rounded-full font-nav text-xs uppercase tracking-wider hover:bg-parfang-accent-dark transition-all duration-300 shadow-sm active:scale-95">
              <Sparkles className="w-3.5 h-3.5" /> Start AI Quiz
            </Link>
            <Link
              aria-label={session ? 'Open profile' : 'Open login'}
              href={session ? '/profile' : '/login'}
              className="text-parfang-text p-1 hover:text-parfang-accent transition-colors"
            >
              {session && profile?.avatar_url ? (
                <span className="relative block h-9 w-9 overflow-hidden rounded-full border border-parfang-border/70 bg-parfang-surface shadow-sm">
                  <Image
                    src={profile.avatar_url}
                    alt={displayName || 'Profile photo'}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </span>
              ) : (
                <User className="w-5 h-5" />
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-parfang-text p-2 hover:text-parfang-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 3. Bottom Layer (Centered Nav Menu) - Hidden on mobile, visible on desktop */}
        <nav className="hidden md:flex justify-center items-center gap-10 pb-4 h-10 border-t border-parfang-border/20 pt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.hasMegaMenu && setShowMegaMenu(true)}
                onMouseLeave={() => link.hasMegaMenu && setShowMegaMenu(false)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    'font-nav text-xs uppercase tracking-[0.15em] flex items-center gap-1.5 pb-2 transition-colors duration-300',
                    isActive ? 'text-parfang-accent' : 'text-parfang-text hover:text-parfang-accent'
                  )}
                >
                  {link.icon}
                  {link.name}
                </Link>
                
                {/* Underline Slide-in animation */}
                {isActive ? (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-parfang-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : (
                  <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-parfang-accent transition-all duration-300 group-hover:w-full group-hover:left-0" />
                )}

                {/* Explore Mega Menu Dropdown */}
                {link.hasMegaMenu && (
                  <AnimatePresence>
                    {showMegaMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full w-[640px] bg-parfang-surface border border-parfang-border shadow-xl p-8 grid grid-cols-4 gap-6 rounded-b-xl z-50"
                      >
                        {megaMenuCategories.map((cat) => (
                          <div
                            key={cat.name}
                            onClick={() => {
                              setShowMegaMenu(false);
                              router.push(cat.href);
                            }}
                            className="group/item cursor-pointer flex flex-col"
                          >
                            <div className="aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-parfang-bg relative">
                              <img
                                src={cat.img}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/5 group-hover/item:bg-black/0 transition-colors duration-500" />
                            </div>
                            <h4 className="font-nav text-xs uppercase tracking-wider text-parfang-text group-hover/item:text-parfang-accent transition-colors">
                              {cat.name}
                            </h4>
                            <p className="font-body text-[10px] text-parfang-muted mt-1 leading-normal">
                              {cat.desc}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>
      </Container>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close mobile menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-20 z-40 bg-parfang-text/20 backdrop-blur-[1px] md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute left-0 right-0 z-50 md:hidden border-t border-parfang-border/50 bg-parfang-surface shadow-xl"
            >
              <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-margin-mobile py-6">
                <div className="flex flex-col gap-4">
                  {!hideGlobalSearch && (
                    <form onSubmit={handleSearchSubmit} className="relative w-full mb-2">
                      <input
                        type="text"
                        placeholder="Search fragrances..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-parfang-bg border border-parfang-border px-4 py-3 pl-10 rounded-full text-sm font-body text-parfang-text focus:outline-none"
                      />
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-parfang-muted" />
                    </form>
                  )}

                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-nav text-sm uppercase tracking-wider py-2 border-b border-parfang-border/30 flex items-center gap-2"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}

                  {session ? (
                    <>
                      <Link
                        href="/favorites"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-nav text-sm uppercase tracking-wider py-2 border-b border-parfang-border/30"
                      >
                        Favorites
                      </Link>
                      <Link
                        href="/wardrobe"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-nav text-sm uppercase tracking-wider py-2 border-b border-parfang-border/30"
                      >
                        My Wardrobe
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-nav text-sm uppercase tracking-wider py-2 border-b border-parfang-border/30"
                      >
                        {displayName}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-nav text-sm uppercase tracking-wider py-2 border-b border-parfang-border/30"
                      >
                        Register
                      </Link>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-nav text-sm uppercase tracking-wider py-2 border-b border-parfang-border/30"
                      >
                        Login
                      </Link>
                    </>
                  )}

                  <Link
                    href="/match"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-4 flex items-center justify-center gap-2 bg-parfang-accent text-white py-3 rounded-full font-nav text-xs uppercase tracking-wider hover:bg-parfang-accent-dark transition-all shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" /> Start AI Quiz
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
