'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function KakaoSection() {
  const t = useTranslations('Settings.Kakao');
  const [isSending, setIsSending] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkToken() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('kakao_access_token')
        .eq('id', user.id)
        .single();

      setHasToken(!!profile?.kakao_access_token);
    }
    checkToken();
  }, [supabase]);

  const handleConnectKakao = async () => {
    setIsConnecting(true);
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/settings`,
        scopes: 'talk_message',
      },
    });
  };

  const testMessage = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/kakao/send-message', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success('🎉 ' + t('testSuccess'));
      } else {
        toast.error(data.error || t('testFailed'));
        if (data.error?.includes('토큰이 없습니다')) {
          setHasToken(false);
        }
      }
    } catch {
      toast.error(t('testFailed'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#FEE500]" />
            {t('title')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {hasToken ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <CheckCircle2 size={13} />
              카카오 연동 완료
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              <AlertCircle size={13} />
              카카오 연동 필요
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-[#FEE500]/5 p-5 rounded-2xl border border-[#FEE500]/20">
        <div className="p-3 bg-[#FEE500]/15 rounded-2xl text-[#FEE500] shrink-0 border border-[#FEE500]/30 shadow-inner">
          <MessageCircle size={26} className="fill-current text-[#FEE500]" />
        </div>
        
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-sm text-foreground">{t('testMessageTitle')}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hasToken 
              ? '연동된 내 카카오톡으로 마감 일정 테스트 메시지를 즉시 발송합니다.' 
              : '현재 구글 계정으로 로그인되어 있거나 카카오 토큰이 없습니다. 아래 버튼으로 카카오톡 권한을 연동하세요.'}
          </p>
        </div>

        <div className="w-full sm:w-auto flex gap-2">
          {!hasToken ? (
            <Button 
              className="w-full sm:w-auto bg-[#FEE500] hover:bg-[#FEE500]/90 text-black font-semibold text-xs gap-1.5 shadow-md"
              onClick={handleConnectKakao}
              disabled={isConnecting}
            >
              <RefreshCw size={14} className={isConnecting ? "animate-spin" : ""} />
              {isConnecting ? '카카오 연결 중...' : '카카오톡 알림 연동하기'}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-[#FEE500]/40 hover:bg-[#FEE500]/10 text-xs font-semibold"
              onClick={testMessage}
              disabled={isSending}
            >
              {isSending ? t('sending') : t('sendTest')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
