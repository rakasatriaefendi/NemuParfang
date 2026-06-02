import { AuthSession } from '@/lib/api/auth';
import { ENV } from '@/lib/env';
import { CommunityComment, CommunityPost, ProfileRecord } from '@/lib/types';
import { validateCommunityText } from '@/lib/community-moderation';

interface CommunityPostRow {
  id: string;
  user_id: string;
  author_display_name: string;
  author_username: string | null;
  author_avatar_url: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
  community_post_likes?: { user_id: string }[];
  community_post_reposts?: { user_id: string }[];
  community_post_comments?: {
    id: string;
    user_id: string;
    author_display_name: string;
    author_username: string | null;
    author_avatar_url: string | null;
    content: string;
    created_at: string;
  }[];
}

const headers = (session?: AuthSession, contentType = 'application/json') => ({
  apikey: ENV.SUPABASE_ANON_KEY,
  ...(session ? { Authorization: `Bearer ${session.accessToken}` } : { Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}` }),
  ...(contentType ? { 'Content-Type': contentType } : {}),
});

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

const mapComment = (row: NonNullable<CommunityPostRow['community_post_comments']>[number]): CommunityComment => ({
  id: row.id,
  userId: row.user_id,
  authorDisplayName: row.author_display_name,
  authorUsername: row.author_username,
  authorAvatarUrl: row.author_avatar_url,
  content: row.content,
  createdAt: formatDate(row.created_at),
});

const mapPost = (row: CommunityPostRow, viewerId?: string): CommunityPost => ({
  id: row.id,
  userId: row.user_id,
  authorDisplayName: row.author_display_name,
  authorUsername: row.author_username,
  authorAvatarUrl: row.author_avatar_url,
  content: row.content,
  imageUrl: row.image_url,
  createdAt: formatDate(row.created_at),
  likeCount: row.community_post_likes?.length || 0,
  commentCount: row.community_post_comments?.length || 0,
  repostCount: row.community_post_reposts?.length || 0,
  likedByViewer: Boolean(viewerId && row.community_post_likes?.some((entry) => entry.user_id === viewerId)),
  repostedByViewer: Boolean(viewerId && row.community_post_reposts?.some((entry) => entry.user_id === viewerId)),
  comments: (row.community_post_comments || []).map(mapComment),
});

const postSelect =
  'id,user_id,author_display_name,author_username,author_avatar_url,content,image_url,created_at,' +
  'community_post_likes(user_id),community_post_reposts(user_id),' +
  'community_post_comments(id,user_id,author_display_name,author_username,author_avatar_url,content,created_at)';

export const loadCommunityFeed = async (search: string, viewerId?: string): Promise<CommunityPost[]> => {
  if (!ENV.HAS_SUPABASE) return [];

  const params = new URLSearchParams({
    select: postSelect,
    order: 'created_at.desc',
    limit: '24',
  });

  if (search.trim()) {
    const needle = search.trim();
    params.set('or', `(content.ilike.*${needle}*,author_display_name.ilike.*${needle}*,author_username.ilike.*${needle}*)`);
  }

  const response = await fetch(`${ENV.SUPABASE_URL}/rest/v1/community_posts?${params.toString()}`, {
    headers: headers(undefined),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load community posts: ${response.status} ${response.statusText}`);
  }

  const rows = (await response.json()) as CommunityPostRow[];
  return rows.map((row) => mapPost(row, viewerId));
};

export const uploadCommunityImage = async (session: AuthSession, file: File) => {
  if (!ENV.HAS_SUPABASE) {
    throw new Error('Supabase is not configured.');
  }

  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Only JPG, JPEG, and PNG images are allowed.');
  }

  const extension = file.type === 'image/png' ? 'png' : 'jpg';
  const objectPath = `${session.user.id}/${crypto.randomUUID()}.${extension}`;

  const response = await fetch(`${ENV.SUPABASE_URL}/storage/v1/object/community-media/${objectPath}`, {
    method: 'POST',
    headers: headers(session, file.type),
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image.');
  }

  return `${ENV.SUPABASE_URL}/storage/v1/object/public/community-media/${objectPath}`;
};

export const createCommunityPost = async (
  session: AuthSession,
  profile: ProfileRecord | null,
  payload: { content: string; imageUrl?: string | null }
) => {
  if (!ENV.HAS_SUPABASE) return;

  const normalizedContent = payload.content.trim();
  if (normalizedContent) {
    const moderation = validateCommunityText(normalizedContent);
    if (!moderation.ok) {
      throw new Error(moderation.reason);
    }
  }

  if (!normalizedContent && !payload.imageUrl) {
    throw new Error('Write something or attach an image before posting.');
  }

  const response = await fetch(`${ENV.SUPABASE_URL}/rest/v1/community_posts`, {
    method: 'POST',
    headers: {
      ...headers(session),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      user_id: session.user.id,
      author_display_name: profile?.display_name || session.user.displayName || session.user.email,
      author_username: profile?.username || session.user.username || null,
      author_avatar_url: profile?.avatar_url || null,
      content: normalizedContent || null,
      image_url: payload.imageUrl || null,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to publish post.');
  }
};

export const toggleCommunityLike = async (session: AuthSession, postId: string, active: boolean) => {
  if (!ENV.HAS_SUPABASE) return;
  const base = `${ENV.SUPABASE_URL}/rest/v1/community_post_likes`;

  if (active) {
    const response = await fetch(base, {
      method: 'POST',
      headers: { ...headers(session), Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ post_id: postId, user_id: session.user.id }),
    });
    if (!response.ok) throw new Error('Failed to like post.');
    return;
  }

  const response = await fetch(`${base}?post_id=eq.${postId}&user_id=eq.${session.user.id}`, {
    method: 'DELETE',
    headers: headers(session),
  });
  if (!response.ok) throw new Error('Failed to remove like.');
};

export const toggleCommunityRepost = async (session: AuthSession, postId: string, active: boolean) => {
  if (!ENV.HAS_SUPABASE) return;
  const base = `${ENV.SUPABASE_URL}/rest/v1/community_post_reposts`;

  if (active) {
    const response = await fetch(base, {
      method: 'POST',
      headers: { ...headers(session), Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ post_id: postId, user_id: session.user.id }),
    });
    if (!response.ok) throw new Error('Failed to repost.');
    return;
  }

  const response = await fetch(`${base}?post_id=eq.${postId}&user_id=eq.${session.user.id}`, {
    method: 'DELETE',
    headers: headers(session),
  });
  if (!response.ok) throw new Error('Failed to remove repost.');
};

export const addCommunityComment = async (
  session: AuthSession,
  profile: ProfileRecord | null,
  postId: string,
  content: string,
) => {
  if (!ENV.HAS_SUPABASE) return;

  const normalizedContent = content.trim();
  const moderation = validateCommunityText(normalizedContent);
  if (!moderation.ok) {
    throw new Error(moderation.reason);
  }

  const response = await fetch(`${ENV.SUPABASE_URL}/rest/v1/community_post_comments`, {
    method: 'POST',
    headers: { ...headers(session), Prefer: 'return=minimal' },
    body: JSON.stringify({
      post_id: postId,
      user_id: session.user.id,
      author_display_name: profile?.display_name || session.user.displayName || session.user.email,
      author_username: profile?.username || session.user.username || null,
      author_avatar_url: profile?.avatar_url || null,
      content: normalizedContent,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to post comment.');
  }
};
