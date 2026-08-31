'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * Profile settings section connected to Supabase auth.
 */
export function ProfileSection() {
  const t = useTranslations('Settings.Profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [provider, setProvider] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setName(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '');
        setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
        setProvider(user.app_metadata?.provider || 'email');
      }
    };
    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (error) throw error;
      toast.success(t('save') + ' 완료!');
    } catch {
      toast.error('프로필 저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = name ? name.slice(0, 2).toUpperCase() : 'WU';

  return (
    <Card className="p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <h2 className="text-xl font-semibold mb-6">{t('title')}</h2>
      
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 flex flex-col gap-4 w-full">
          <div className="grid gap-2">
            <label className="text-sm font-medium">{t('name')}</label>
            <div className="flex gap-2">
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="이름 입력"
              />
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? '저장 중...' : t('save')}
              </Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">{t('email')}</label>
            <Input value={email || '로그인 계정'} disabled />
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-3">{t('connectedAccounts')}</h3>
            <div className="flex gap-3">
              {provider === 'kakao' ? (
                <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Kakao
                </Badge>
              ) : provider === 'google' ? (
                <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Google
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  WithUs Account
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
