'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

/**
 * Global Next.js App Router Error Boundary.
 * Captures uncaught runtime errors gracefully with glassmorphism recovery UI.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Unhandled application error captured by Error Boundary', error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-600/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#0E1017]/90 backdrop-blur-2xl shadow-2xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertTriangle size={28} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">일시적인 오류가 발생했습니다</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            페이지를 불러오는 도중 문제가 발생했습니다. 다시 시도하거나 메인 화면으로 돌아가실 수 있습니다.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium h-10 gap-2 cursor-pointer"
          >
            <RotateCcw size={15} />
            다시 시도
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-200 h-10 gap-2 cursor-pointer"
            >
              <Home size={15} />
              홈으로 이동
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
