'use client';

import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2, Layout, Clock, Calendar } from 'lucide-react';
import { useState } from 'react';

/**
 * High-end, Linear/Raycast/Notion inspired Landing & Login Portal.
 * Clean, professional, human-crafted design with zero generic AI vibe.
 */
export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState<'kakao' | 'google' | null>(null);
  const supabase = createClient();

  const handleKakaoLogin = async () => {
    setIsLoggingIn('kakao');
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn('google');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const features = [
    {
      icon: Layout,
      title: '트리플 뷰 태스크 매니저',
      desc: '리스트, 칸반 보드, 스프레드시트 테이블 뷰를 언제든 자유롭게 전환'
    },
    {
      icon: MessageCircle,
      title: '카카오톡 나에게 보내기 연동',
      desc: '정해진 시간에 나에게 카톡으로 발송되는 스마트 푸시 알림'
    },
    {
      icon: Clock,
      title: '뽀모도로 포커스 타이머',
      desc: '태스크와 실시간 연동되어 누적 작업 시간이 기록되는 집중 세션'
    },
    {
      icon: Calendar,
      title: '지능형 캘린더 & 분석',
      desc: '월간/주간 마감일 시각화와 생산성 스코어 대시보드 제공'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-white/[0.06] backdrop-blur-md bg-[#090A0F]/60 px-6 lg:px-16 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden ring-1 ring-white/20 shadow-lg shadow-indigo-500/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="WithUs Todo" className="h-full w-full object-cover" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white flex items-center gap-2">
            WithUs Todo
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Pro
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleKakaoLogin}
            className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-[#FEE500] text-black hover:bg-[#FEE500]/90 transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            <MessageCircle size={14} className="fill-current" />
            카카오로 3초 시작
          </button>
        </div>
      </header>

      {/* Hero & Auth Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center flex-1">
        {/* Left Column: Product Narrative */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-zinc-300 backdrop-blur-sm">
            <Sparkles size={13} className="text-cyan-400" />
            <span className="font-medium text-zinc-200">생산성을 위한 가장 진보된 투두 시스템</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
              정돈된 일상, <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                탁월한 성취의 시작.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl font-normal leading-relaxed">
              단순한 메모를 넘어 칸반 보드, 뽀모도로 포커스 타이머, 그리고 실시간 카카오톡 리마인더까지. 당신의 모든 프로젝트와 일정을 하나의 유려한 인터페이스에서 완결하세요.
            </p>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-start gap-3.5 group"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 group-hover:border-indigo-400/40 transition-colors">
                  <feat.icon size={18} />
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="text-sm font-semibold text-zinc-200">{feat.title}</h4>
                  <p className="text-xs text-zinc-400 leading-normal">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" /> 무료 계정 생성
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" /> 설치 없는 웹 기반
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-cyan-400" /> SSL 보안 암호화
            </span>
          </div>
        </div>

        {/* Right Column: Premium Auth Card */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md p-8 rounded-2xl border border-white/[0.1] bg-[#0E1017]/90 backdrop-blur-2xl shadow-2xl shadow-black/80 relative"
          >
            {/* Ambient card accent glow */}
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-2 mb-8 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-3 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="WithUs" className="h-10 w-10 object-cover rounded-xl" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">WithUs 시작하기</h3>
              <p className="text-xs text-zinc-400">
                원클릭 소셜 로그인으로 3초 만에 나만의 워크스페이스에 접속하세요.
              </p>
            </div>

            <div className="space-y-3.5">
              <button
                onClick={handleKakaoLogin}
                disabled={isLoggingIn !== null}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-[#FEE500] hover:bg-[#FEE500]/95 text-black font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <MessageCircle size={18} className="fill-current" />
                <span>{isLoggingIn === 'kakao' ? '연결 중...' : '카카오 계정으로 계속하기'}</span>
              </button>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn !== null}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 font-medium text-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span>{isLoggingIn === 'google' ? '연결 중...' : 'Google 계정으로 계속하기'}</span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                계속 진행함으로써 WithUs의{' '}
                <span className="text-zinc-400 underline underline-offset-2 cursor-pointer">이용약관</span> 및{' '}
                <span className="text-zinc-400 underline underline-offset-2 cursor-pointer">개인정보처리방침</span>에 동의하게 됩니다.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-6 px-6 text-center text-xs text-zinc-600 flex flex-col sm:flex-row justify-between items-center max-w-6xl mx-auto w-full gap-2">
        <span>© {new Date().getFullYear()} WithUs Todo. All rights reserved.</span>
        <div className="flex gap-4">
          <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer">서비스 소개</span>
          <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer">도움말</span>
          <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer">개인정보보호</span>
        </div>
      </footer>
    </div>
  );
}
