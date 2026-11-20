import type { Metadata } from 'next';

import { MetricsPage } from '@/views/metrics';

export const metadata: Metadata = {
  title: 'Метрики',
};
const Page = async () => {
  return <MetricsPage />;
};
export default Page;
