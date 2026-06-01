"use client";

import React from 'react';
import Link from 'next/link';
import { LogOut, Sparkles } from 'lucide-react';
import { useAuthSession, useCollections } from '@/components/auth/AuthProvider';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/Button';
import { CollectionSection } from '@/components/profile/CollectionSection';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const { session, profile, signOut } = useAuthSession();
  const { favorites, wardrobe } = useCollections();
  return <ProtectedRoute><div className="min-h-screen bg-parfang-bg py-14"><Container><div className="flex flex-wrap items-end justify-between gap-5 border-b border-parfang-border pb-8"><div><p className="font-handwrite text-3xl text-parfang-accent">Your scent archive</p><h1 className="mt-2 font-display text-5xl">Fragrance Journal</h1><p className="mt-3 font-body text-sm text-parfang-muted">{profile?.display_name || session?.user.displayName || session?.user.email}</p><p className="mt-1 font-body text-xs text-parfang-muted">{session?.user.email}</p></div><Button variant="ghost" onClick={signOut}><LogOut className="h-4 w-4" /> Logout</Button></div><section className="py-12"><div className="rounded-lg border border-parfang-border bg-parfang-surface p-6 md:flex md:items-center md:justify-between"><div><p className="font-nav text-xs uppercase tracking-widest text-parfang-accent">Fragrance DNA</p><h2 className="mt-2 font-display text-3xl">Refine your olfactory signature.</h2></div><Link href="/match"><Button className="mt-5 md:mt-0"><Sparkles className="h-4 w-4" /> Start AI Match</Button></Link></div></section><CollectionSection title="Favorites" perfumeIds={favorites} previewLimit={5} href="/favorites" empty="Favorite fragrances from the library to build your personal shortlist." /><CollectionSection title="Wardrobe" perfumeIds={wardrobe} previewLimit={5} href="/wardrobe" empty="Your wardrobe is ready for scents you already own or want to track." /></Container></div></ProtectedRoute>;
}
