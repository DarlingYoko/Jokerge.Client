'use client';

import { useState } from 'react';

import { DASHBOARD_PAGES } from '@/shared/routes';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { SentryStats } from '@/widgets/sentry-stats';
import { SentryAnalytics, SentryIssueFocus } from '@/widgets/sentry-analytics';

type SentryTab = 'overview' | 'issues';

export const SentryPage = () => {
  const [tab, setTab] = useState<SentryTab>('overview');
  const [focus, setFocus] = useState<SentryIssueFocus>();

  const openIssue = (fingerprint: string) => {
    setFocus({ fingerprint, nonce: Date.now() });
    setTab('issues');
  };

  return (
    <>
      <Breadcrumbs
        current="Ошибки"
        breadcrumbs={[{ value: 'Главная', path: DASHBOARD_PAGES.HOME }]}
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as SentryTab)}>
        <TabsList className="mb-4 grid w-fit grid-cols-2">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="issues">Проблемы</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <SentryStats onOpenIssue={openIssue} onOpenAll={() => setTab('issues')} />
        </TabsContent>
        <TabsContent value="issues" forceMount className="data-[state=inactive]:hidden">
          <SentryAnalytics focus={focus} />
        </TabsContent>
      </Tabs>
    </>
  );
};
