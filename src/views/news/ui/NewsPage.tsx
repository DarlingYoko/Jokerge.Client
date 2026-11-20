'use client';

import { DASHBOARD_PAGES } from '@/shared/routes';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';
import { NewsList } from '@/widgets/news-list';

export const NewsPage = () => {
  return (
    <>
      <Breadcrumbs
        current={'Новости'}
        breadcrumbs={[{ value: 'Главная', path: DASHBOARD_PAGES.HOME }]}
      />

      <NewsList />
    </>
  );
};
