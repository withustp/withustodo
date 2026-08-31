import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 404 Not Found Page.
 * Professional, glassmorphic layout guiding users back to the dashboard.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#0E1017]/90 backdrop-blur-2xl shadow-2xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Compass size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">404 Error</span>
          <h2 className="text-2xl font-bold tracking-tight text-white">페이지를 찾을 수 없습니다</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            요청하신 주소가 잘못되었거나 삭제된 페이지입니다.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/dashboard" className="block">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium h-10 gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              대시보드로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
