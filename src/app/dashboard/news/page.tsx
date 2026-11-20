import type { Metadata } from 'next';

import { NewsPage } from '@/views/news';

export const metadata: Metadata = {
  title: 'Новости',
};

const Page = () => {
  return <NewsPage />;
};

export default Page;
