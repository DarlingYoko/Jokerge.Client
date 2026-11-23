import { ReloadIcon } from '@radix-ui/react-icons';

import { GameServersSkeleton } from './GameServersSkeleton';

import { CreateGameServerDialog } from '@/features/create-game-server';
import { GameServerCard } from '@/widgets/game-server-card';
import { useCheckGameServers, useGameServers } from '@/shared/hooks';
import { ProfileExtendedBaseEntity } from '@/shared/api/contracts';
import { Button } from '@/shared/ui/button';
import { Icons } from '@/shared/ui/icons';

interface GameServersParams {
  profile: ProfileExtendedBaseEntity;
}

export const GameServers = ({ profile }: GameServersParams) => {
  const { data, isLoading } = useGameServers({ profileName: profile.profileName });
  const { mutate: checkServers, isPending: isChecking } = useCheckGameServers();

  if (isLoading) return <GameServersSkeleton />;

  return (
    <div className="grid gap-y-4">
      <div className="flex flex-row flex-wrap gap-2">
        <CreateGameServerDialog profile={profile} />
        <Button
          variant="outline"
          className="w-fit gap-2"
          disabled={isChecking || !data?.length}
          onClick={() => checkServers({ profileName: profile.profileName })}
          title="Пропинговать все адреса профиля с сервера API"
        >
          {isChecking ? (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          ) : (
            <ReloadIcon width={16} height={16} />
          )}
          Проверить
        </Button>
      </div>
      <div className="flex flex-col gap-y-2">
        {data?.map((server, index) => (
          <GameServerCard
            key={`${server.name}-${index}`}
            server={server}
            profileName={profile.profileName}
            isMain={index === 0}
          />
        ))}
      </div>
    </div>
  );
};
