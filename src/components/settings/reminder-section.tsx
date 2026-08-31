'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function ReminderSection() {
  const t = useTranslations('Settings.Reminders');
  const [quietHours, setQuietHours] = useState(false);

  return (
    <Card className="p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <h2 className="text-xl font-semibold mb-6">{t('title')}</h2>
      
      <div className="flex flex-col gap-6">
        <div className="grid gap-2 max-w-xs">
          <label className="text-sm font-medium">{t('defaultInterval')}</label>
          <Select defaultValue="15">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t('intervals.0')}</SelectItem>
              <SelectItem value="15">{t('intervals.15')}</SelectItem>
              <SelectItem value="30">{t('intervals.30')}</SelectItem>
              <SelectItem value="60">{t('intervals.60')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">{t('quietHours')}</h3>
              <p className="text-sm text-muted-foreground">{t('quietHoursDesc')}</p>
            </div>
            <Switch checked={quietHours} onCheckedChange={setQuietHours} />
          </div>
          
          {quietHours && (
            <div className="flex gap-4 items-center">
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">{t('start')}</label>
                <Input type="time" defaultValue="22:00" />
              </div>
              <span className="mt-6 text-muted-foreground">to</span>
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">{t('end')}</label>
                <Input type="time" defaultValue="07:00" />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
