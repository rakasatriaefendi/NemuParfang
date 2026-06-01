"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthSession } from '@/components/auth/AuthProvider';
import { signIn, signUp } from '@/lib/api/auth';
import { updateProfile } from '@/lib/api/profile';

export const AuthForm: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuthSession();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const session = await (mode === 'login' ? signIn(email, password) : signUp(email, password, displayName.trim()));
      if (mode === 'register' && displayName.trim()) {
        await updateProfile(session, { display_name: displayName.trim(), username: null });
        session.user.displayName = displayName.trim();
      }
      setSession(session);
      router.push(searchParams.get('redirect') || '/profile');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Autentikasi gagal.');
      setLoading(false);
    }
  };
  return <form onSubmit={submit} className="w-full max-w-md bg-parfang-surface p-7 shadow-sm md:p-10"><p className="font-nav text-xs uppercase tracking-[0.2em] text-parfang-accent">{mode === 'login' ? 'Welcome Back' : 'Create Profile'}</p><h1 className="mt-3 font-display text-4xl">{mode === 'login' ? 'Continue your discovery.' : 'Save your fragrance story.'}</h1><p className="mt-3 font-body text-sm leading-6 text-parfang-muted">Browse freely. Sign in when you want to keep favorites, wardrobe selections, and your Fragrance DNA.</p>{mode === 'register' && <label className="mt-8 block font-nav text-[11px] uppercase tracking-widest">Nickname<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 w-full border-b border-parfang-border bg-transparent py-3 font-body text-sm outline-none focus:border-parfang-accent" placeholder="How should we call you?" /></label>}<label className={mode === 'register' ? 'mt-6 block font-nav text-[11px] uppercase tracking-widest' : 'mt-8 block font-nav text-[11px] uppercase tracking-widest'}>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border-b border-parfang-border bg-transparent py-3 font-body text-sm outline-none focus:border-parfang-accent" /></label><label className="mt-6 block font-nav text-[11px] uppercase tracking-widest">Password<div className="relative"><input required minLength={6} type={visible ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full border-b border-parfang-border bg-transparent py-3 pr-10 font-body text-sm outline-none focus:border-parfang-accent" /><button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-0 top-4 p-2 text-parfang-muted">{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>{error && <p className="mt-5 font-body text-xs leading-5 text-red-700">{error}</p>}<Button type="submit" className="mt-8 w-full" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</Button><p className="mt-6 text-center font-body text-xs text-parfang-muted">{mode === 'login' ? 'New here?' : 'Already registered?'} <Link className="text-parfang-accent underline" href={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create a profile' : 'Login'}</Link></p></form>;
};
