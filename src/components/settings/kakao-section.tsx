'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function KakaoSection() {
  const t = useTranslations('Settings.Kakao');
  const [isSending, setIsSending] = useState(false);

  const testMessage = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/kakao/send-message', { method: 'POST' });
      if (res.ok) {
        alert(t('testSuccess'));
      } else {
        alert(t('testFailed'));
      }
    } catch (e) {
      alert(t('testFailed'));
    }
    setIsSending(false);
  };

  return (
    <Card className="p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>
          <span className="font-medium text-yellow-600 dark:text-yellow-400">{t('connected')}</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
        <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400">
          <MessageCircle size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{t('testMessageTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('testMessageDesc')}</p>
        </div>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto border-yellow-500/30 hover:bg-yellow-500/10"
          onClick={testMessage}
          disabled={isSending}
        >
          {isSending ? t('sending') : t('sendTest')}
        </Button>
      </div>
    </Card>
  );
}
