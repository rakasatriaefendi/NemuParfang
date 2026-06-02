"use client";

import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BriefcaseBusiness, Heart, LogOut, Sparkles } from 'lucide-react';
import { useAuthSession, useCollections } from '@/components/auth/AuthProvider';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/Button';
import { CollectionSection } from '@/components/profile/CollectionSection';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { updateProfile } from '@/lib/api/profile';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png']);

export default function ProfilePage() {
  const { session, profile, signOut, isReady, setSession } = useAuthSession();
  const { favorites, wardrobe } = useCollections();

  const displayName = profile?.display_name || session?.user.displayName || session?.user.email;
  const publicUrl = useMemo(() => {
    if (typeof window === 'undefined' || !profile?.username) return null;
    return `${window.location.origin}/u/${profile.username}`;
  }, [profile?.username]);

  const [form, setForm] = useState({
    display_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    is_public: false,
    show_favorites: true,
    show_reviews: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setForm({
      display_name: profile?.display_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      avatar_url: profile?.avatar_url || '',
      is_public: profile?.is_public || false,
      show_favorites: profile?.show_favorites ?? true,
      show_reviews: profile?.show_reviews ?? true,
    });
  }, [profile]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaveError('');
    setSaveMessage('');

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setSaveError('Profile photo must be a JPG, JPEG, or PNG image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setSaveError('Profile photo must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read the selected image.'));
      reader.readAsDataURL(file);
    });

    setForm((current) => ({ ...current, avatar_url: dataUrl }));
    event.target.value = '';
  };

  const handleSaveProfile = async () => {
    if (!session) return;

    const normalizedUsername = form.username.trim().toLowerCase();
    if (normalizedUsername && !/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setSaveError('Username must be 3-20 characters and use only lowercase letters, numbers, or underscores.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    try {
      await updateProfile(session, {
        display_name: form.display_name.trim() || null,
        username: normalizedUsername || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatar_url || null,
        is_public: form.is_public,
        show_favorites: form.show_favorites,
        show_reviews: form.show_reviews,
      });

      setSession({
        ...session,
        user: {
          ...session.user,
          displayName: form.display_name.trim() || session.user.displayName,
          username: normalizedUsername || undefined,
        },
      });
      setSaveMessage('Profile updated.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-parfang-bg py-14">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-parfang-border pb-8">
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-parfang-border bg-parfang-surface text-xl font-nav uppercase tracking-widest text-parfang-muted">
                {form.avatar_url ? (
                  <Image src={form.avatar_url} alt={displayName || 'Profile photo'} fill className="object-cover" />
                ) : (
                  (displayName || 'N').slice(0, 1)
                )}
              </div>
              <div>
                <p className="font-handwrite text-3xl text-parfang-accent">Your scent archive</p>
                <h1 className="mt-2 font-display text-5xl">Fragrance Journal</h1>
                <p className="mt-3 font-body text-sm text-parfang-muted">{displayName}</p>
                <p className="mt-1 font-body text-xs text-parfang-muted">{session?.user.email}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>

          <section className="grid gap-4 py-8 md:grid-cols-3">
            <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-parfang-bg p-2 text-parfang-accent">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Favorites</p>
                  <p className="mt-1 font-display text-3xl text-parfang-text">
                    {isReady ? favorites.length.toLocaleString() : '…'}
                  </p>
                </div>
              </div>
              <Link href="/favorites" className="mt-4 inline-block font-nav text-[10px] uppercase tracking-widest text-parfang-accent">
                Open favorites
              </Link>
            </div>

            <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-parfang-bg p-2 text-parfang-accent">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Wardrobe</p>
                  <p className="mt-1 font-display text-3xl text-parfang-text">
                    {isReady ? wardrobe.length.toLocaleString() : '…'}
                  </p>
                </div>
              </div>
              <Link href="/wardrobe" className="mt-4 inline-block font-nav text-[10px] uppercase tracking-widest text-parfang-accent">
                Open wardrobe
              </Link>
            </div>

            <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-5">
              <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-accent">Fragrance DNA</p>
              <h2 className="mt-3 font-display text-2xl text-parfang-text">Refine your olfactory signature.</h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-parfang-muted">
                Keep building your taste profile as your collection and reviews grow.
              </p>
              <Link href="/match" className="mt-5 inline-block">
                <Button>
                  <Sparkles className="h-4 w-4" /> Start AI Match
                </Button>
              </Link>
            </div>
          </section>

          <section className="grid gap-6 border-t border-parfang-border py-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-6">
              <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent">Profile settings</span>
              <h2 className="mt-3 font-display text-3xl text-parfang-text">Identity and privacy</h2>
              <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-parfang-muted">
                Your profile stays private by default. Turn on public visibility only if you want to share your review voice and favorites with other fragrance seekers.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="font-nav text-[10px] uppercase tracking-widest text-parfang-text">Display name</span>
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))}
                    className="rounded-xl border border-parfang-border bg-parfang-bg px-4 py-3 text-sm text-parfang-text outline-none transition focus:border-parfang-accent"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="font-nav text-[10px] uppercase tracking-widest text-parfang-text">Username</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value.toLowerCase() }))}
                    placeholder="e.g. scentnotes"
                    className="rounded-xl border border-parfang-border bg-parfang-bg px-4 py-3 text-sm text-parfang-text outline-none transition focus:border-parfang-accent"
                  />
                </label>
              </div>

              <label className="mt-5 flex flex-col gap-2">
                <span className="font-nav text-[10px] uppercase tracking-widest text-parfang-text">Bio</span>
                <textarea
                  rows={4}
                  maxLength={280}
                  value={form.bio}
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  className="rounded-xl border border-parfang-border bg-parfang-bg px-4 py-3 text-sm text-parfang-text outline-none transition focus:border-parfang-accent"
                />
              </label>

              <div className="mt-5">
                <span className="font-nav text-[10px] uppercase tracking-widest text-parfang-text">Profile photo</span>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-parfang-border px-4 py-2 text-xs uppercase tracking-widest text-parfang-text transition hover:border-parfang-accent hover:text-parfang-accent">
                    Upload JPG / PNG
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  {form.avatar_url && (
                    <Button
                      variant="secondary"
                      onClick={() => setForm((current) => ({ ...current, avatar_url: '' }))}
                    >
                      Remove photo
                    </Button>
                  )}
                </div>
                <p className="mt-2 font-body text-xs text-parfang-muted">
                  Only static JPG, JPEG, and PNG images are allowed. GIF, video, and animated formats are not supported.
                </p>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-parfang-border bg-parfang-bg p-5">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={(event) => setForm((current) => ({ ...current, is_public: event.target.checked }))}
                    className="mt-1 h-4 w-4 accent-parfang-accent"
                  />
                  <span>
                    <span className="block font-body text-sm font-medium text-parfang-text">Make my profile public</span>
                    <span className="block font-body text-xs text-parfang-muted">This creates a shareable profile page at your username URL.</span>
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.show_favorites}
                    onChange={(event) => setForm((current) => ({ ...current, show_favorites: event.target.checked }))}
                    disabled={!form.is_public}
                    className="mt-1 h-4 w-4 accent-parfang-accent disabled:opacity-40"
                  />
                  <span>
                    <span className="block font-body text-sm font-medium text-parfang-text">Show favorites publicly</span>
                    <span className="block font-body text-xs text-parfang-muted">Wardrobe always stays private in this MVP.</span>
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.show_reviews}
                    onChange={(event) => setForm((current) => ({ ...current, show_reviews: event.target.checked }))}
                    disabled={!form.is_public}
                    className="mt-1 h-4 w-4 accent-parfang-accent disabled:opacity-40"
                  />
                  <span>
                    <span className="block font-body text-sm font-medium text-parfang-text">Show reviews publicly</span>
                    <span className="block font-body text-xs text-parfang-muted">Only your public review history will be shown, never your email.</span>
                  </span>
                </label>
              </div>

              {(saveError || saveMessage) && (
                <div className={`mt-5 rounded-xl px-4 py-3 text-sm ${saveError ? 'border border-red-200 bg-red-50 text-red-600' : 'border border-green-200 bg-green-50 text-green-700'}`}>
                  {saveError || saveMessage}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save profile'}
                </Button>
                {publicUrl && form.is_public && (
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="font-nav text-[10px] uppercase tracking-widest text-parfang-accent">
                    Open public profile
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-6">
              <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent">Public profile preview</span>
              <h2 className="mt-3 font-display text-3xl text-parfang-text">What others can see</h2>
              <div className="mt-6 rounded-2xl border border-parfang-border bg-parfang-bg p-5">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-parfang-border bg-parfang-surface text-lg font-nav uppercase tracking-widest text-parfang-muted">
                    {form.avatar_url ? (
                      <Image src={form.avatar_url} alt={form.display_name || 'Profile preview'} fill className="object-cover" />
                    ) : (
                      (form.display_name || displayName || 'N').slice(0, 1)
                    )}
                  </div>
                  <div>
                    <p className="font-display text-2xl text-parfang-text">{form.display_name || displayName}</p>
                    <p className="font-body text-xs text-parfang-muted">@{form.username || 'username-needed'}</p>
                  </div>
                </div>
                <p className="mt-4 font-body text-sm leading-relaxed text-parfang-muted">
                  {form.bio || 'Add a short bio to describe your fragrance taste, collecting habits, or favorite scent moods.'}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-parfang-border bg-parfang-surface px-4 py-3">
                    <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Public favorites</p>
                    <p className="mt-1 font-display text-2xl text-parfang-text">{form.is_public && form.show_favorites ? favorites.length : 0}</p>
                  </div>
                  <div className="rounded-xl border border-parfang-border bg-parfang-surface px-4 py-3">
                    <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Public reviews</p>
                    <p className="mt-1 font-display text-2xl text-parfang-text">{form.is_public && form.show_reviews ? 'Visible' : 'Hidden'}</p>
                  </div>
                </div>
                <p className="mt-4 font-body text-xs text-parfang-muted">
                  Wardrobe remains private by default and is not shown on the public profile in this MVP.
                </p>
              </div>
            </div>
          </section>

          <CollectionSection
            title="Favorites"
            perfumeIds={favorites}
            previewLimit={5}
            href="/favorites"
            empty="Favorite fragrances from the library to build your personal shortlist."
          />

          <CollectionSection
            title="Wardrobe"
            perfumeIds={wardrobe}
            previewLimit={5}
            href="/wardrobe"
            empty="Your wardrobe is ready for scents you already own or want to track."
          />
        </Container>
      </div>
    </ProtectedRoute>
  );
}
