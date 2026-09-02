'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, AlertTriangle, FileSpreadsheet, FileCode, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useTasks } from '@/hooks/use-tasks';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DataSection() {
  const t = useTranslations('Settings.Data');
  const { refresh } = useTasks();
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleClearCompleted = async () => {
    setIsClearing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('tasks')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('status', 'done');

      if (error) throw error;
      toast.success('완료된 모든 작업이 휴지통으로 이동되었습니다.');
      refresh();
    } catch {
      toast.error('완료 항목 정리 중 오류가 발생했습니다.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 계정을 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      return;
    }
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').delete().eq('id', user.id);
      }
      await supabase.auth.signOut();
      toast.info('계정이 안전하게 탈퇴되었습니다.');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('계정 탈퇴 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-xl border border-destructive/30 shadow-lg space-y-6">
      <div className="border-b border-border/50 pb-4">
        <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          {t('title')}
        </h3>
        <p className="text-xs text-muted-foreground">{t('exportDesc')}</p>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Export Data */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/50">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t('exportData')}</h4>
            <p className="text-xs text-muted-foreground">{t('exportDesc')}</p>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-1.5 text-xs bg-background/50" asChild>
              <a href="/api/export?format=csv"><FileSpreadsheet size={14}/> CSV 다운로드</a>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-1.5 text-xs bg-background/50" asChild>
              <a href="/api/export?format=json"><FileCode size={14}/> JSON 백업</a>
            </Button>
          </div>
        </div>

        {/* Clear Completed */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/50">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t('clearCompleted')}</h4>
            <p className="text-xs text-muted-foreground">{t('clearCompletedDesc')}</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleClearCompleted}
            disabled={isClearing}
            className="w-full sm:w-auto text-xs text-destructive hover:bg-destructive/10 border border-destructive/20"
          >
            {isClearing ? '정리 중...' : t('clearCompletedBtn')}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-sm font-semibold text-destructive">{t('deleteAccount')}</h4>
            <p className="text-xs text-muted-foreground">{t('deleteAccountDesc')}</p>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full sm:w-auto gap-1.5 text-xs shadow-md"
          >
            <Trash2 size={14} />
            {isDeleting ? '처리 중...' : t('deleteAccountBtn')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
