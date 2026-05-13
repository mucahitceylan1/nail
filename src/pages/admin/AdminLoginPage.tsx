// src/pages/admin/AdminLoginPage.tsx
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const defaultSchema = z.object({
  email: z.string().email('Lütfen geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type DefaultFormValues = z.infer<typeof defaultSchema>;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isSupabaseConfigured, isAdmin, session, loading, signInWithEmail, authError: contextAuthError } = useAuth();

  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register: registerDefault,
    handleSubmit: handleDefaultFormSubmit,
    formState: { errors: defaultErrors },
  } = useForm<DefaultFormValues>({
    resolver: zodResolver(defaultSchema),
  });

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  const onDefaultSubmit = async (data: DefaultFormValues) => {
    setAuthError('');
    setSubmitting(true);
    const { error: err } = await signInWithEmail(data.email.trim(), data.password);
    if (err) setAuthError(err);
    else navigate('/admin');
    setSubmitting(false);
  };

  if (!loading && session && isAdmin) {
    return null; // useEffect will navigate
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-3)',
      }}
    >
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 600,
              fontStyle: 'italic',
              color: 'var(--color-accent)',
            }}
          >
            Nail Lab.
          </span>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              marginTop: '4px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Yönetim Paneli
          </p>
        </div>

        <div className="card" style={{ padding: '32px 28px' }}>
          {!isSupabaseConfigured ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--color-danger)', lineHeight: 1.6 }}>
              Admin girişi için Supabase yapılandırması zorunludur.
              <br />
              `.env` dosyasında `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` (veya
              yeni paneldeki `VITE_SUPABASE_PUBLISHABLE_KEY`) ve opsiyonel
              `VITE_ADMIN_EMAILS` tanımlayın.
            </div>
          ) : (
            <form onSubmit={handleDefaultFormSubmit(onDefaultSubmit)}>
              <div style={{ marginBottom: 'var(--sp-3)' }}>
                <Input
                  label="E-posta"
                  type="email"
                  placeholder="admin@ornek.com"
                  error={defaultErrors.email?.message}
                  icon={<Mail size={16} />}
                  autoComplete="email"
                  autoFocus
                  {...registerDefault('email')}
                />
              </div>
              <div style={{ marginBottom: 'var(--sp-3)' }}>
                <Input
                  label="Şifre"
                  type="password"
                  placeholder="••••••••"
                  error={defaultErrors.password?.message || authError || (contextAuthError && !authError ? contextAuthError : undefined)}
                  icon={<Lock size={16} />}
                  autoComplete="current-password"
                  {...registerDefault('password')}
                />
              </div>
              <Button variant="primary" type="submit" loading={submitting} style={{ width: '100%' }}>
                Giriş Yap
              </Button>
            </form>
          )} 
        </div>
      </div>
    </motion.div>
  );
}
