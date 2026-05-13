import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { dbCheckIsAdmin } from '../api/supabase/ops';
import { clearLocalStores, refreshAdminData, refreshPublicData } from '../api/supabase/sync';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthContext } from './auth-context';

const parseAdminEmails = () => {
  const raw = String(import.meta.env.VITE_ADMIN_EMAILS ?? '').trim();
  if (!raw) return null;
  const list = raw
    .split(',')
    .map((v: string) => v.trim().toLowerCase())
    .filter(Boolean);
  return list.length > 0 ? new Set(list) : null;
};

const ADMIN_EMAILS = parseAdminEmails();

/** RPC / network can hang indefinitely in some environments; never block auth init forever. */
const ADMIN_CHECK_TIMEOUT_MS = 6_000;
const AUTH_HARD_STOP_TIMEOUT_MS = 8_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(() => configured);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const adminAccessGenerationRef = useRef(0);

  const resolveAdminAccess = useCallback(async (nextSession: Session | null) => {
    if (!nextSession || !configured || !supabase) {
      setIsAdmin(false);
      setAuthError(null);
      clearLocalStores();
      return false;
    }

    const email = nextSession.user.email?.toLowerCase();
    if (ADMIN_EMAILS && (!email || !ADMIN_EMAILS.has(email))) {
      setIsAdmin(false);
      setAuthError('Bu hesap admin erisim listesinde degil.');
      clearLocalStores();
      return false;
    }

    const generation = ++adminAccessGenerationRef.current;

    type Outcome = { tag: 'ok'; allowed: boolean } | { tag: 'timeout' } | { tag: 'error'; err: unknown };

    const outcome = await new Promise<Outcome>((resolve) => {
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled || generation !== adminAccessGenerationRef.current) return;
        settled = true;
        console.warn('dbCheckIsAdmin: timeout');
        resolve({ tag: 'timeout' });
      }, ADMIN_CHECK_TIMEOUT_MS);

      dbCheckIsAdmin()
        .then((v) => {
          if (settled || generation !== adminAccessGenerationRef.current) return;
          settled = true;
          window.clearTimeout(timer);
          resolve({ tag: 'ok', allowed: v });
        })
        .catch((err: unknown) => {
          if (settled || generation !== adminAccessGenerationRef.current) return;
          settled = true;
          window.clearTimeout(timer);
          resolve({ tag: 'error', err });
        });
    });

    if (generation !== adminAccessGenerationRef.current) {
      return false;
    }

    if (outcome.tag === 'error') {
      console.error('dbCheckIsAdmin:', outcome.err);
      setIsAdmin(false);
      setAuthError('Admin yetkisi dogrulanamadi.');
      clearLocalStores();
      return false;
    }

    if (outcome.tag === 'timeout') {
      setIsAdmin(false);
      setAuthError('Admin yetkisi dogrulanamadi (zaman asimi).');
      clearLocalStores();
      return false;
    }

    const allowed = outcome.allowed;
    setIsAdmin(allowed);
    setAuthError(allowed ? null : 'Bu hesap admin yetkisine sahip degil.');
    if (!allowed) {
      clearLocalStores();
    }
    return allowed;
  }, [configured]);

  useEffect(() => {
    if (!configured || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let hardStopTimer: number | undefined;

    const clearLoadingIfActive = () => {
      if (!cancelled) {
        if (hardStopTimer !== undefined) {
          window.clearTimeout(hardStopTimer);
          hardStopTimer = undefined;
        }
        setLoading(false);
      }
    };

    hardStopTimer = window.setTimeout(() => {
      if (!cancelled) {
        console.warn('AuthProvider: hard stop — clearing loading after getSession stall');
        clearLoadingIfActive();
      }
    }, AUTH_HARD_STOP_TIMEOUT_MS);

    // We rely on onAuthStateChange (INITIAL_SESSION event) as the primary mechanism.
    // getSession is only used as a safety net — it does NOT call resolveAdminAccess
    // to avoid double RPC calls and NavigatorLockAcquireTimeoutError.
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        if (cancelled) return;
        // If onAuthStateChange already fired (loading is false), skip.
        // Otherwise just set session; the listener will handle admin check.
        setSession((prev) => prev ?? s);
      })
      .catch((e) => {
        console.error('getSession error:', e);
        clearLoadingIfActive();
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      console.log('onAuthStateChange:', event, s?.user?.email);
      setSession(s);
      void (async () => {
        const allowed = await resolveAdminAccess(s);
        if (allowed) {
          refreshAdminData().catch((e) => console.error('refreshAdminData:', e));
        } else {
          refreshPublicData().catch((e) => console.error('refreshPublicData:', e));
        }
        clearLoadingIfActive();
      })();
    });

    return () => {
      cancelled = true;
      if (hardStopTimer !== undefined) window.clearTimeout(hardStopTimer);
      subscription.unsubscribe();
    };
  }, [configured, resolveAdminAccess]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!configured || !supabase) {
      return { error: 'Admin girisi icin Supabase yapilandirmasi zorunludur.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (ADMIN_EMAILS && !ADMIN_EMAILS.has(normalizedEmail)) {
      return { error: 'Bu hesap admin erisim listesinde degil.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) return { error: error.message };

    const allowed = await resolveAdminAccess(data.session);
    if (!allowed) {
      await supabase.auth.signOut();
      return {
        error: ADMIN_EMAILS
          ? 'Bu hesap admin erisim listesinde degil.'
          : 'Bu hesap admin yetkisine sahip degil.',
      };
    }

    setAuthError(null);
    return { error: null };
  }, [configured, resolveAdminAccess]);

  const signOutSupabase = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      isSupabaseConfigured: configured,
      isAdmin,
      authError,
      signInWithEmail,
      signOutSupabase,
    }),
    [session, loading, configured, isAdmin, authError, signInWithEmail, signOutSupabase]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
