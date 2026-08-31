'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function ProfileSection() {
  const t = useTranslations('Settings.Profile');
  const [name, setName] = useState('John Doe');
  
  return (
    <Card className="p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <h2 className="text-xl font-semibold mb-6">{t('title')}</h2>
      
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Avatar className="w-24 h-24">
          <AvatarImage src="" />
          <AvatarFallback className="text-2xl">JD</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 flex flex-col gap-4 w-full">
          <div className="grid gap-2">
            <label className="text-sm font-medium">{t('name')}</label>
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <Button>{t('save')}</Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">{t('email')}</label>
            <Input value="john.doe@example.com" disabled />
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-3">{t('connectedAccounts')}</h3>
            <div className="flex gap-3">
              <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Google
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Kakao
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
