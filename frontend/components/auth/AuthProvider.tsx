"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthSession } from '@/lib/api/auth';
import { loadCollections, persistCollection } from '@/lib/api/collections';
import { loadProfile } from '@/lib/api/profile';
import { ProfileRecord } from '@/lib/types';

interface AuthSessionContextValue {
  session: AuthSession | null;
  profile: ProfileRecord | null;
  isReady: boolean;
  setSession: (session: AuthSession | null) => void;
  signOut: () => void;
}

interface CollectionsContextValue {
  favorites: string[];
  wardrobe: string[];
  toggleFavorite: (id: string) => void;
  toggleWardrobe: (id: string) => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);
const CollectionsContext = createContext<CollectionsContextValue | null>(null);
const AUTH_COOKIE = 'nemuparfang-auth';

const readIds = (key: string) => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || '[]') as string[];
  } catch {
    return [];
  }
};

const syncAuthCookie = (authenticated: boolean) => {
  if (typeof document === 'undefined') return;
  document.cookie = authenticated
    ? `${AUTH_COOKIE}=1; Path=/; Max-Age=2592000; SameSite=Lax`
    : `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wardrobe, setWardrobe] = useState<string[]>([]);
  const pendingFavoritesRef = useRef(new Set<string>());
  const pendingWardrobeRef = useRef(new Set<string>());

  useEffect(() => {
    const stored = window.localStorage.getItem('nemuparfang-session');
    if (stored) {
      try {
        setSessionState(JSON.parse(stored) as AuthSession);
        syncAuthCookie(true);
      } catch {
        window.localStorage.removeItem('nemuparfang-session');
        syncAuthCookie(false);
      }
    } else {
      syncAuthCookie(false);
    }
    setFavorites(readIds('nemuparfang-favorites'));
    setWardrobe(readIds('nemuparfang-wardrobe'));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!session) return;
    loadProfile(session).then((record) => {
      setProfile(record);
    });
  }, [session?.user.id, session?.accessToken]);

  useEffect(() => {
    if (!session) return;
    loadCollections(session).then((rows) => {
      if (!rows) return;
      const remoteFavorites = rows.filter((row) => row.collection_type === 'favorite').map((row) => row.perfume_id);
      const remoteWardrobe = rows.filter((row) => row.collection_type === 'wardrobe').map((row) => row.perfume_id);
      setFavorites(remoteFavorites);
      setWardrobe(remoteWardrobe);
      window.localStorage.setItem('nemuparfang-favorites', JSON.stringify(remoteFavorites));
      window.localStorage.setItem('nemuparfang-wardrobe', JSON.stringify(remoteWardrobe));
    });
  }, [session?.user.id, session?.accessToken]);

  const setSession = (next: AuthSession | null) => {
    setSessionState(next);
    if (next) {
      window.localStorage.setItem('nemuparfang-session', JSON.stringify(next));
      syncAuthCookie(true);
    } else {
      setProfile(null);
      setFavorites([]);
      setWardrobe([]);
      pendingFavoritesRef.current.clear();
      pendingWardrobeRef.current.clear();
      window.localStorage.removeItem('nemuparfang-session');
      window.localStorage.removeItem('nemuparfang-favorites');
      window.localStorage.removeItem('nemuparfang-wardrobe');
      syncAuthCookie(false);
    }
  };

  const toggleCollection = (
    key: string,
    id: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    pendingRef: React.MutableRefObject<Set<string>>,
    collectionType: 'favorite' | 'wardrobe'
  ) => {
    if (pendingRef.current.has(id)) return;
    pendingRef.current.add(id);

    setter((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      const previous = current;
      window.localStorage.setItem(key, JSON.stringify(next));

      if (session) {
        void persistCollection(session, id, collectionType, next.includes(id))
          .catch(() => {
            setter(previous);
            window.localStorage.setItem(key, JSON.stringify(previous));
          })
          .finally(() => {
            pendingRef.current.delete(id);
          });
      } else {
        pendingRef.current.delete(id);
      }

      return next;
    });
  };

  const sessionValue = useMemo<AuthSessionContextValue>(() => ({
    session,
    profile,
    isReady,
    setSession,
    signOut: () => setSession(null),
  }), [isReady, profile, session]);

  const collectionsValue = useMemo<CollectionsContextValue>(() => ({
    favorites,
    wardrobe,
    toggleFavorite: (id) => toggleCollection('nemuparfang-favorites', id, setFavorites, pendingFavoritesRef, 'favorite'),
    toggleWardrobe: (id) => toggleCollection('nemuparfang-wardrobe', id, setWardrobe, pendingWardrobeRef, 'wardrobe'),
  }), [favorites, wardrobe]);

  return (
    <AuthSessionContext.Provider value={sessionValue}>
      <CollectionsContext.Provider value={collectionsValue}>
        {children}
      </CollectionsContext.Provider>
    </AuthSessionContext.Provider>
  );
};

export const useAuthSession = () => {
  const value = useContext(AuthSessionContext);
  if (!value) throw new Error('useAuthSession must be used inside AuthProvider.');
  return value;
};

export const useCollections = () => {
  const value = useContext(CollectionsContext);
  if (!value) throw new Error('useCollections must be used inside AuthProvider.');
  return value;
};

export const useAuth = () => {
  const sessionValue = useContext(AuthSessionContext);
  const collectionsValue = useContext(CollectionsContext);
  if (!sessionValue || !collectionsValue) throw new Error('useAuth must be used inside AuthProvider.');
  return {
    ...sessionValue,
    ...collectionsValue,
  };
};
