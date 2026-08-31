'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Mail, MessageCircle } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

/**
 * Login Page with OAuth providers.
 */
export default function LoginPage() {
  const t = useTranslations('Auth');
  const supabase = createClient();

  const handleKakaoLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md space-y-8 rounded-2xl bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="WithUs Todo Logo" className="h-full w-full object-cover" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              WithUs Todo
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <button
            onClick={handleKakaoLogin}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#FEE500] px-4 py-3 text-sm font-semibold text-black hover:bg-[#FEE500]/90 transition-colors shadow-sm"
          >
            <MessageCircle className="h-5 w-5" />
            {t('continueWithKakao')}
          </button>

          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm"
          >
            <Mail className="h-5 w-5 text-gray-600" />
            {t('continueWithGoogle')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
