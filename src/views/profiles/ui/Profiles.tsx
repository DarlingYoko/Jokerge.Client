'use client';

import { CreateProfileDialog } from '@/widgets/create-profile-dialog';
import { ProfilesTable } from '@/widgets/profiles-table';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs';
import { DASHBOARD_PAGES } from '@/shared/routes';
import { ProfilesCard } from '@/widgets/profiles-table/ui/ProfilesCard';
import { useMediaQuery } from '@/shared/hooks';

export const ProfilesPage = () => {
  // Renders one variant at a time instead of mounting both and hiding one with CSS, so the desktop
  // table and mobile cards don't both fetch/build their state on every load.
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <>
      <Breadcrumbs
        current={'Профили'}
        breadcrumbs={[{ value: 'Главная', path: DASHBOARD_PAGES.HOME }]}
      />
      <div className="flex flex-col items-start py-4">
        <div className="flex justify-between w-full">
          <h1 className="text-xl font-bold mb-8">Профили</h1>
          <CreateProfileDialog />
        </div>
        <div className="flex-col gap-y-6 w-full flex">
          {isDesktop ? <ProfilesTable /> : <ProfilesCard />}
        </div>
      </div>
    </>
  );
};
