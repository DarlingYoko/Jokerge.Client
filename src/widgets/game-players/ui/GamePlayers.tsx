'use client';

import { useMemo, useState } from 'react';
import { Search, TrashIcon } from 'lucide-react';

import { useDeleteProfilePlayers } from '@/shared/hooks';
import { ProfileExtendedBaseEntity } from '@/shared/api/contracts';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { $api } from '@/services/api.service';
import { CreateWhiteUserDialog } from '@/features/create-game-white-user';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useGamePlayerStore } from '@/shared/store/gamePlayerStore';
import { filterPlayersByName } from '@/shared/lib/players/whitelist';

interface GamePlayersParams {
  profile: ProfileExtendedBaseEntity;
}

const SEARCH_FROM = 8;

export const GamePlayers = ({ profile }: GamePlayersParams) => {
  // Selectors, not the whole store: the page re-rendered on every add/remove otherwise.
  const players = useGamePlayerStore((state) => state.players);
  const removePlayer = useGamePlayerStore((state) => state.removePlayer);
  const { mutateAsync, isPending } = useDeleteProfilePlayers({ profileName: profile.profileName });
  const [query, setQuery] = useState('');

  const visible = useMemo(() => filterPlayersByName(players, query), [players, query]);

  const deletePlayer = (uuid: string) => {
    mutateAsync({ playerUuid: uuid })
      .then(() => removePlayer(uuid))
      .catch(() => {
        // Error toast comes from the mutation's onError.
      });
  };

  return (
    <div className="grid gap-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CreateWhiteUserDialog profile={profile} playersState={players} />
        <p className="text-sm text-muted-foreground">
          {players.length === 0
            ? 'Белый список пуст: профиль доступен всем игрокам, если он включён'
            : `В белом списке: ${players.length}. Остальные игроки профиль не видят`}
        </p>
      </div>

      {players.length >= SEARCH_FROM && (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Найти в списке"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        {visible.map((player) => (
          <Card key={player.uuid} className="w-[300px]">
            <CardHeader className="flex flex-row justify-between items-start">
              <img
                src={$api.getUri() + `/integrations/texture/head/${player.uuid}`}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                onError={(event) => (event.currentTarget.style.visibility = 'hidden')}
                className="w-12 h-12 mt-1 rounded-lg shrink-0"
              />
              <div className="ml-2 min-w-0 flex-1">
                <CardTitle className="font-bold truncate" title={player.name}>
                  {player.name}
                </CardTitle>
                <CardDescription className="font-medium mt-1">
                  {player.isBanned ? 'Заблокирован' : 'Не заблокирован'}
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                className="w-8 h-8 p-0 shrink-0"
                disabled={isPending}
                title="Убрать из белого списка"
                onClick={() => deletePlayer(player.uuid)}
              >
                <TrashIcon size="16" />
              </Button>
            </CardHeader>
          </Card>
        ))}
        {players.length > 0 && visible.length === 0 && (
          <p className="text-sm text-muted-foreground">Никого не нашлось</p>
        )}
      </div>
    </div>
  );
};
