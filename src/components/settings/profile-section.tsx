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
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  LogOut, 
  Check, 
  Calendar,
  Layers,
  KeyRound
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Enterprise-grade User Profile & Account Management Hub
 * Synchronizes display_name, bio, and avatar directly with Supabase profiles table
 */
export function ProfileSection() {
  const t = useTranslations('Settings.Profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [userId, setUserId] = useState('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [lastSignIn, setLastSignIn] = useState<string>('');
  const [provider, setProvider] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setEmail(user.email || '');
        setBio(user.user_metadata?.bio || 'WithUs Todo와 함께 스마트한 생산성 관리 중 🚀');
        setProvider(user.app_metadata?.provider || 'google');
        
        // 1. Fetch live profile from profiles table first
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();

        const effectiveName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
        const effectiveAvatar = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

        setName(effectiveName);
        setAvatarUrl(effectiveAvatar);

        if (user.created_at) {
          const date = new Date(user.created_at);
          setCreatedAt(date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }));
        }
        if (user.last_sign_in_at) {
          const signDate = new Date(user.last_sign_in_at);
          setLastSignIn(signDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
        }
      }
    };
    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('표시 이름을 입력해주세요.');
      return;
    }
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('인증되지 않았습니다.');

      // 1. Update Supabase profiles table directly
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: name.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Update Auth metadata
      await supabase.auth.updateUser({
        data: { 
          full_name: name.trim(),
          name: name.trim(),
          bio: bio,
          avatar_url: avatarUrl
        }
      });

      toast.success('프로필 표시 이름이 성공적으로 변경되었습니다!');
      router.refresh();
    } catch (err: any) {
      console.error('Save profile error:', err);
      toast.error('프로필 저장 중 오류가 발생했습니다: ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  const copyUserId = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setIsCopied(true);
    toast.success('고유 계정 ID가 클립보드에 복사되었습니다.');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('로그아웃되었습니다.');
    router.push('/login');
    router.refresh();
  };

  const initials = name ? name.slice(0, 2).toUpperCase() : 'WU';

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/10 via-background/60 to-purple-500/10 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <Avatar className="w-20 h-20 relative border-2 border-background shadow-xl">
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background shadow-sm" title="Online" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{name || 'User'}</h2>
                <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  PRO MEMBER
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {email || '이메일 정보 없음'}
              </p>
              {createdAt && (
                <p className="text-xs text-muted-foreground/80 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  가입일: {createdAt}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-destructive/30 hover:bg-destructive/10 text-destructive text-xs gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </Button>
          </div>
        </div>
      </Card>

      {/* Profile Edit Form Card */}
      <Card className="p-6 bg-card/60 backdrop-blur-xl border border-border/80 shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              기본 프로필 정보
            </h3>
            <p className="text-xs text-muted-foreground">이름 및 상태 메시지를 수정할 수 있습니다.</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-md"
          >
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              표시 이름 (Display Name)
            </label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="표시할 닉네임 입력"
              className="bg-background/50 focus:bg-background transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              이메일 주소 (Email)
            </label>
            <div className="relative">
              <Input 
                value={email || '로그인 계정'} 
                disabled 
                className="bg-muted/40 text-muted-foreground pr-8 cursor-not-allowed"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" title="인증된 계정" />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-medium text-foreground">
              상태 메시지 / 다짐 (Status Bio)
            </label>
            <Input 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="나만의 생산성 다짐이나 한 줄 소개"
              className="bg-background/50 focus:bg-background transition-colors"
            />
          </div>
        </div>
      </Card>

      {/* Security & Connected OAuth Card */}
      <Card className="p-6 bg-card/60 backdrop-blur-xl border border-border/80 shadow-lg space-y-6">
        <div className="border-b border-border/50 pb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            보안 및 연결된 소셜 계정
          </h3>
          <p className="text-xs text-muted-foreground">현재 계정에 연결된 인증 제공자 및 보안 식별자입니다.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Provider Card */}
          <div className="p-4 rounded-xl border border-border/60 bg-background/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {provider === 'kakao' ? (
                <div className="w-10 h-10 rounded-lg bg-[#FEE500] flex items-center justify-center shadow-sm">
                  <span className="font-black text-black text-sm">TALK</span>
                </div>
              ) : provider === 'google' ? (
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <span className="font-bold text-blue-600 text-sm">G</span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="text-sm font-semibold capitalize text-foreground">
                  {provider === 'kakao' ? '카카오 계정' : provider === 'google' ? '구글 계정' : 'WithUs 통합 계정'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lastSignIn ? `최근 로그인: ${lastSignIn}` : '활성 상태'}
                </div>
              </div>
            </div>

            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs px-2.5 py-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              연결됨
            </Badge>
          </div>

          {/* User ID Card */}
          <div className="p-4 rounded-xl border border-border/60 bg-background/40 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium">계정 고유 식별자 (UID)</div>
              <div className="text-xs font-mono text-foreground/80 mt-1 truncate max-w-[180px] sm:max-w-[200px]">
                {userId || 'Loading...'}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyUserId}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? '복사됨' : '복사'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
