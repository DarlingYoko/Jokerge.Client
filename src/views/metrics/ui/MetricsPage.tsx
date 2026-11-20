'use client';

import { DASHBOARD_PAGES } from '@/shared/routes';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';
import { ApiMetrics } from '@/widgets/api-metrics';

export const MetricsPage = () => (
  <>
    <Breadcrumbs
      current="Метрики"
      breadcrumbs={[{ value: 'Главная', path: DASHBOARD_PAGES.HOME }]}
    />
    <ApiMetrics />
  </>
);
