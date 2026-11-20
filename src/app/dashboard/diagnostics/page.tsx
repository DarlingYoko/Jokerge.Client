import type { Metadata } from 'next';

import { DiagnosticsPage } from '@/views/diagnostics';

export const metadata: Metadata = {
  title: 'Диагностика',
};
const Page = async () => {
  return <DiagnosticsPage />;
};
export default Page;
