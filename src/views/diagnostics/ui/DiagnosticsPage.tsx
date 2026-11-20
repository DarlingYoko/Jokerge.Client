'use client';

import { DASHBOARD_PAGES } from '@/shared/routes';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';
import { DiagnosticsReports } from '@/widgets/diagnostics-reports';

export const DiagnosticsPage = () => {
  return (
    <>
      <Breadcrumbs
        current="Диагностика"
        breadcrumbs={[{ value: 'Главная', path: DASHBOARD_PAGES.HOME }]}
      />

      <p className="mb-4 text-sm text-muted-foreground">
        Отчёты, которые игроки отправляют из лаунчера: система, память, диск, Java, связь с
        серверами и хвост лога. Нажмите на строку, чтобы открыть отчёт целиком.
      </p>

      <DiagnosticsReports />
    </>
  );
};
