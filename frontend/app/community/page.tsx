"use client";

import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ImagePlus, MessageCircle, Repeat2, Search, Share2, Sparkles, X } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/Button';
import { useAuthSession } from '@/components/auth/AuthProvider';
import {
  addCommunityComment,
  createCommunityPost,
  loadCommunityFeed,
  toggleCommunityLike,
  toggleCommunityRepost,
  uploadCommunityImage,
} from '@/lib/api/community';
import { CommunityPost } from '@/lib/types';
import { cn } from '@/lib/utils';

const MAX_POST_IMAGE_BYTES = 4 * 1024 * 1024;

export default function CommunityPage() {
  const router = useRouter();
  const { session, profile, isReady } = useAuthSession();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const [feedError, setFeedError] = useState('');
  const [isSearchCompact, setIsSearchCompact] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSearchCompact(window.scrollY > 160);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFlashMessage('');
      setFeedError('');
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [flashMessage, feedError]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const nextPosts = await loadCommunityFeed(search, session?.user.id);
        if (!active) return;
        setPosts(nextPosts);
        setIsLoading(false);
      } catch {
        if (!active) return;
        setHasError(true);
        setIsLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [search, session?.user.id]);

  const displayName = profile?.display_name || session?.user.displayName || session?.user.email;
  const stickyExpanded = !isSearchCompact || isSearchExpanded;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setFeedError('Only JPG, JPEG, and PNG images are allowed for community posts.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_POST_IMAGE_BYTES) {
      setFeedError('Community images must be 4 MB or smaller.');
      event.target.value = '';
      return;
    }

    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    setSelectedImage(file);
    setSelectedImagePreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const resetComposer = () => {
    setDraft('');
    setSelectedImage(null);
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
      setSelectedImagePreview(null);
    }
  };

  const refreshFeed = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const nextPosts = await loadCommunityFeed(search, session?.user.id);
      setPosts(nextPosts);
      setIsLoading(false);
    } catch {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!session) {
      router.push('/login?redirect=/community');
      return;
    }

    setIsPosting(true);
    setFeedError('');
    try {
      const imageUrl = selectedImage ? await uploadCommunityImage(session, selectedImage) : null;
      await createCommunityPost(session, profile, {
        content: draft,
        imageUrl,
      });
      resetComposer();
      await refreshFeed();
      setFlashMessage('Your post is live.');
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : 'Could not publish your post.');
    } finally {
      setIsPosting(false);
    }
  };

  const updatePostState = (postId: string, updater: (post: CommunityPost) => CommunityPost) => {
    setPosts((current) => current.map((post) => (post.id === postId ? updater(post) : post)));
  };

  const handleToggleLike = async (post: CommunityPost) => {
    if (!session) {
      router.push('/login?redirect=/community');
      return;
    }

    const nextActive = !post.likedByViewer;
    updatePostState(post.id, (current) => ({
      ...current,
      likedByViewer: nextActive,
      likeCount: current.likeCount + (nextActive ? 1 : -1),
    }));

    try {
      await toggleCommunityLike(session, post.id, nextActive);
    } catch (error) {
      updatePostState(post.id, (current) => ({
        ...current,
        likedByViewer: post.likedByViewer,
        likeCount: post.likeCount,
      }));
      setFeedError(error instanceof Error ? error.message : 'Could not update like.');
    }
  };

  const handleToggleRepost = async (post: CommunityPost) => {
    if (!session) {
      router.push('/login?redirect=/community');
      return;
    }

    const nextActive = !post.repostedByViewer;
    updatePostState(post.id, (current) => ({
      ...current,
      repostedByViewer: nextActive,
      repostCount: current.repostCount + (nextActive ? 1 : -1),
    }));

    try {
      await toggleCommunityRepost(session, post.id, nextActive);
      setFlashMessage(nextActive ? 'Post reposted to your activity.' : 'Repost removed.');
    } catch (error) {
      updatePostState(post.id, (current) => ({
        ...current,
        repostedByViewer: post.repostedByViewer,
        repostCount: post.repostCount,
      }));
      setFeedError(error instanceof Error ? error.message : 'Could not update repost.');
    }
  };

  const handleShare = async (post: CommunityPost) => {
    const shareUrl = `${window.location.origin}/community#${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${post.authorDisplayName} on NemuParfang Community`,
          text: post.content || 'A fragrance community post on NemuParfang.',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
      setFlashMessage('Post link copied.');
    } catch {
      setFeedError('Could not share this post right now.');
    }
  };

  const handleComment = async (post: CommunityPost) => {
    if (!session) {
      router.push('/login?redirect=/community');
      return;
    }

    const content = (commentDrafts[post.id] || '').trim();
    if (!content) return;

    try {
      await addCommunityComment(session, profile, post.id, content);
      setCommentDrafts((current) => ({ ...current, [post.id]: '' }));
      await refreshFeed();
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : 'Could not publish comment.');
    }
  };

  const emptyState = useMemo(
    () => ({
      title: search.trim() ? 'No posts match your search' : 'The community feed is still quiet',
      description: search.trim()
        ? 'Try a shorter search phrase or explore a broader fragrance topic.'
        : 'Be the first to share a bottle photo, a scent impression, or a quick blind-buy thought.',
    }),
    [search],
  );

  return (
    <div className="min-h-screen bg-parfang-bg pb-24">
      <Container className="pt-10">
        <div className="border-b border-parfang-border pb-8 text-left">
          <p className="font-handwrite text-3xl text-parfang-accent">Community exchange</p>
          <h1 className="mt-2 font-display text-5xl text-parfang-text">Shared scent notes</h1>
          <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-parfang-muted">
            Post a bottle photo, a short thought, or both. Likes, comments, reposts, and share links are open to the community, while language with SARA or explicit NSFW content is blocked by a strict MVP filter.
          </p>
        </div>
      </Container>

      <div className="sticky top-20 z-30 border-b border-parfang-border/50 bg-parfang-bg/95 backdrop-blur-md">
        <Container className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div
              className={cn(
                'flex items-center gap-3 rounded-full border border-parfang-border bg-parfang-surface px-4 py-2 transition-all duration-300',
                stickyExpanded ? 'w-full max-w-xl' : 'w-14 justify-center',
              )}
            >
              <button
                type="button"
                onClick={() => setIsSearchExpanded((current) => !current)}
                className="text-parfang-muted transition hover:text-parfang-accent"
              >
                <Search className="h-4 w-4" />
              </button>
              {stickyExpanded && (
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts, moods, brands, or people..."
                  className="w-full bg-transparent text-sm text-parfang-text outline-none"
                />
              )}
            </div>
            {!stickyExpanded && (
              <span className="hidden font-nav text-[10px] uppercase tracking-widest text-parfang-muted md:block">Search community</span>
            )}
          </div>
        </Container>
      </div>

      <Container className="grid gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-parfang-border bg-parfang-surface p-6 text-left">
            <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent">Create post</span>
            <h2 className="mt-3 font-display text-3xl text-parfang-text">What are you wearing today?</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-parfang-muted">
              Share text, a static image, or both. JPG, JPEG, and PNG only. GIF, video, and animated formats are blocked in this MVP.
            </p>

            {session ? (
              <>
                <div className="mt-5 flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-parfang-border bg-parfang-bg text-sm font-nav uppercase tracking-widest text-parfang-muted">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt={displayName || 'Profile photo'} fill className="object-cover" />
                    ) : (
                      (displayName || 'N').slice(0, 1)
                    )}
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium text-parfang-text">{displayName}</p>
                    <p className="font-body text-xs text-parfang-muted">
                      {profile?.is_public && profile?.username ? `Posting as @${profile.username}` : 'Posting privately from your account identity'}
                    </p>
                  </div>
                </div>

                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Share a scent impression, compliment trail, layering thought, or bottle shot note..."
                  className="mt-5 min-h-[160px] w-full rounded-2xl border border-parfang-border bg-parfang-bg px-4 py-3 text-sm text-parfang-text outline-none transition focus:border-parfang-accent"
                />

                {selectedImagePreview && (
                  <div className="relative mt-4 overflow-hidden rounded-2xl border border-parfang-border bg-parfang-bg">
                    <div className="relative aspect-[4/3] w-full">
                      <Image src={selectedImagePreview} alt="Selected community upload preview" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={resetComposer}
                      className="absolute right-3 top-3 rounded-full bg-parfang-surface/90 p-2 text-parfang-text shadow-sm transition hover:text-parfang-accent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {(feedError || flashMessage) && (
                  <div className={cn(
                    'mt-4 rounded-xl px-4 py-3 text-sm',
                    feedError ? 'border border-red-200 bg-red-50 text-red-600' : 'border border-green-200 bg-green-50 text-green-700',
                  )}>
                    {feedError || flashMessage}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-parfang-border px-4 py-2 text-xs uppercase tracking-widest text-parfang-text transition hover:border-parfang-accent hover:text-parfang-accent">
                    <ImagePlus className="h-4 w-4" />
                    Add image
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <Button onClick={handlePublish} disabled={isPosting}>
                    {isPosting ? 'Publishing…' : 'Publish post'}
                  </Button>
                  <span className="font-body text-xs text-parfang-muted">{draft.length}/2000</span>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-parfang-border bg-parfang-bg p-5">
                <p className="font-body text-sm leading-relaxed text-parfang-muted">
                  Sign in to publish posts, share bottle photos, and join the conversation.
                </p>
                <div className="mt-4">
                  <Link href="/login?redirect=/community">
                    <Button>Login to post</Button>
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-5">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <div key={index} className="h-[260px] animate-pulse rounded-3xl border border-parfang-border bg-parfang-surface" />
              ))
            ) : hasError ? (
              <div className="rounded-3xl border border-parfang-border bg-parfang-surface p-8 text-center">
                <h3 className="font-display text-3xl text-parfang-text">Community unavailable</h3>
                <p className="mx-auto mt-3 max-w-lg font-body text-sm leading-relaxed text-parfang-muted">
                  We could not load the feed right now. Try again in a moment.
                </p>
                <div className="mt-5">
                  <Button onClick={refreshFeed}>Try again</Button>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-3xl border border-parfang-border bg-parfang-surface p-10 text-center">
                <h3 className="font-display text-3xl text-parfang-text">{emptyState.title}</h3>
                <p className="mx-auto mt-3 max-w-lg font-body text-sm leading-relaxed text-parfang-muted">
                  {emptyState.description}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} id={post.id} className="rounded-3xl border border-parfang-border bg-parfang-surface p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-parfang-border bg-parfang-bg text-sm font-nav uppercase tracking-widest text-parfang-muted">
                      {post.authorAvatarUrl ? (
                        <Image src={post.authorAvatarUrl} alt={post.authorDisplayName} fill className="object-cover" />
                      ) : (
                        post.authorDisplayName.slice(0, 1)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-body text-sm font-medium text-parfang-text">{post.authorDisplayName}</p>
                        {post.authorUsername && (
                          <Link href={`/u/${post.authorUsername}`} className="font-body text-xs text-parfang-accent">
                            @{post.authorUsername}
                          </Link>
                        )}
                        <span className="font-body text-xs text-parfang-muted">{post.createdAt}</span>
                      </div>

                      {post.content && (
                        <p className="mt-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-parfang-text">
                          {post.content}
                        </p>
                      )}

                      {post.imageUrl && (
                        <div className="relative mt-4 overflow-hidden rounded-2xl border border-parfang-border bg-parfang-bg">
                          <div className="relative aspect-[4/3] w-full">
                            <Image src={post.imageUrl} alt="Community post image" fill className="object-cover" />
                          </div>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-parfang-border pt-4">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post)}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition',
                            post.likedByViewer
                              ? 'border-parfang-accent bg-parfang-accent text-white'
                              : 'border-parfang-border text-parfang-text hover:border-parfang-accent hover:text-parfang-accent',
                          )}
                        >
                          <Heart className="h-4 w-4" />
                          {post.likeCount}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleRepost(post)}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition',
                            post.repostedByViewer
                              ? 'border-parfang-accent bg-parfang-accent text-white'
                              : 'border-parfang-border text-parfang-text hover:border-parfang-accent hover:text-parfang-accent',
                          )}
                        >
                          <Repeat2 className="h-4 w-4" />
                          {post.repostCount}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(post)}
                          className="inline-flex items-center gap-2 rounded-full border border-parfang-border px-4 py-2 text-xs uppercase tracking-widest text-parfang-text transition hover:border-parfang-accent hover:text-parfang-accent"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>

                        <span className="inline-flex items-center gap-2 rounded-full border border-parfang-border px-4 py-2 text-xs uppercase tracking-widest text-parfang-muted">
                          <MessageCircle className="h-4 w-4" />
                          {post.commentCount}
                        </span>
                      </div>

                      <div className="mt-5 rounded-2xl border border-parfang-border bg-parfang-bg p-4">
                        <div className="space-y-3">
                          {post.comments.slice(0, 3).map((comment) => (
                            <div key={comment.id} className="rounded-xl border border-parfang-border bg-parfang-surface p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-body text-xs font-medium text-parfang-text">{comment.authorDisplayName}</span>
                                {comment.authorUsername && (
                                  <Link href={`/u/${comment.authorUsername}`} className="font-body text-[11px] text-parfang-accent">
                                    @{comment.authorUsername}
                                  </Link>
                                )}
                                <span className="font-body text-[11px] text-parfang-muted">{comment.createdAt}</span>
                              </div>
                              <p className="mt-2 font-body text-sm text-parfang-text">{comment.content}</p>
                            </div>
                          ))}
                        </div>

                        {session ? (
                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                              type="text"
                              value={commentDrafts[post.id] || ''}
                              onChange={(event) =>
                                setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))
                              }
                              placeholder="Add a comment..."
                              className="w-full rounded-full border border-parfang-border bg-parfang-surface px-4 py-3 text-sm text-parfang-text outline-none transition focus:border-parfang-accent"
                            />
                            <Button onClick={() => handleComment(post)}>Comment</Button>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <Link href="/login?redirect=/community" className="font-nav text-[10px] uppercase tracking-widest text-parfang-accent">
                              Login to comment
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-parfang-border bg-parfang-surface p-6 text-left">
            <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent">Community guide</span>
            <h2 className="mt-3 font-display text-3xl text-parfang-text">Post thoughtfully</h2>
            <ul className="mt-4 space-y-3 font-body text-sm leading-relaxed text-parfang-muted">
              <li>Share bottle shots, scent diaries, layering notes, and wear impressions.</li>
              <li>Only static JPG, JPEG, and PNG images are accepted in this MVP.</li>
              <li>GIFs, videos, explicit NSFW, and SARA language are blocked by the posting filter.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-parfang-border bg-parfang-surface p-6 text-left">
            <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent">Why it matters</span>
            <h2 className="mt-3 font-display text-3xl text-parfang-text">Human scent context</h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-parfang-muted">
              Community posts add lived context that raw notes and accords cannot capture alone: weather, compliments, projection, and the feeling of wearing a scent in real life.
            </p>
            <div className="mt-5">
              <Link href="/explore">
                <Button variant="secondary">Explore fragrances</Button>
              </Link>
            </div>
          </div>
        </aside>
      </Container>
    </div>
  );
}
