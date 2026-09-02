'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Globe, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Appearance & Interface Customization Section
 */
export function AppearanceSection() {
  const t = useTranslations('Settings.Appearance');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('ko');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const isKo = document.cookie.includes('NEXT_LOCALE=ko');
    setCurrentLocale(isKo ? 'ko' : 'en');
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    setCurrentLocale(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  if (!mounted) return null;

  const themeOptions = [
    { id: 'light', label: t('themes.light'), icon: Sun, desc: '밝고 선명한 라이트 테마' },
    { id: 'dark', label: t('themes.dark'), icon: Moon, desc: '눈이 편안한 글래스 다크 테마' },
    { id: 'system', label: t('themes.system'), icon: Monitor, desc: '운영체제 시스템 설정 동기화' }
  ];

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-xl border border-border/80 shadow-lg space-y-6">
      <div className="border-b border-border/50 pb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('title')}</h3>
        <p className="text-xs text-muted-foreground">앱의 테마 모드와 기본 표시 언어를 자유롭게 변경하세요.</p>
      </div>
      
      <div className="space-y-6">
        {/* Theme Picker */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-primary" />
            {t('theme')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;
              const Icon = opt.icon;
              return (
                <button 
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-xl border transition-all text-left relative group",
                    isSelected 
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm" 
                      : "border-border/60 bg-background/40 hover:border-primary/40 hover:bg-background/80"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <div className={cn(
                    "p-2 rounded-lg mb-3 transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selector */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            {t('language')}
          </label>
          <div className="max-w-xs">
            <Select value={currentLocale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="bg-background/50 border-border/60 focus:bg-background">
                <SelectValue placeholder="언어 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ko">🇰🇷 한국어 (Korean)</SelectItem>
                <SelectItem value="en">🇺🇸 English (US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}
