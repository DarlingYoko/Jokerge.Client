'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { PlusIcon } from '@radix-ui/react-icons';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Icons } from '@/shared/ui/icons';
import { useAddProfilePlayers } from '@/shared/hooks';
import { usePlayers } from '@/shared/hooks/usePlayers';
import { PlayerBaseEntity, ProfileExtendedBaseEntity } from '@/shared/api/contracts';
import { $api } from '@/services/api.service';
import { useGamePlayerStore } from '@/shared/store/gamePlayerStore';
import { markWhitelisted } from '@/shared/lib/players/whitelist';

type CreateWhiteUserDialogParams = {
  profile?: ProfileExtendedBaseEntity;
  playersState: PlayerBaseEntity[];
};

const SEARCH_DELAY_MS = 300;

/**
 * Stays open so several players can be added in a row. The old version closed after every player,
 * and its throttle was recreated on each render, so every keystroke fired two searches.
 */
export const CreateWhiteUserDialog = ({ profile, playersState }: CreateWhiteUserDialogParams) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [input]);

  const { data: players, isFetching, hasNextPage, fetchNextPage } = usePlayers(search);
  const { mutateAsync } = useAddProfilePlayers(profile?.profileName);
  const addPlayer = useGamePlayerStore((state) => state.addPlayer);

  const rows = useMemo(() => markWhitelisted(players ?? [], playersState), [players, playersState]);

  const add = async (uuid: string) => {
    if (!profile) return;
    setAdding(uuid);
    try {
      const response = await mutateAsync({ profileName: profile.profileName, userUuid: uuid });
      addPlayer(response.data.data);
    } catch {
      // Error toast comes from the mutation's onError.
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setInput('');
          setSearch('');
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-fit gap-2">
          <PlusIcon width={16} height={16} />
          Добавить игроков
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Белый список профиля</DialogTitle>
          <DialogDescription>
            Найдите игрока и нажмите «Добавить». Окно не закрывается, можно добавить сразу
            нескольких.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            className="pl-9"
            placeholder="Ник игрока"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>

        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {rows.map(({ player, inWhitelist }) => (
            <div
              key={player.uuid}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50"
            >
              <img
                src={$api.getUri() + `/integrations/texture/head/${player.uuid}`}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
                onError={(event) => (event.currentTarget.style.visibility = 'hidden')}
                className="h-7 w-7 rounded-md"
              />
              <span className="min-w-0 flex-1 truncate font-medium" title={player.name}>
                {player.name}
              </span>
              {inWhitelist ? (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Check className="h-4 w-4" />В списке
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={adding !== null}
                  onClick={() => void add(player.uuid)}
                >
                  {adding === player.uuid && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Добавить
                </Button>
              )}
            </div>
          ))}

          {!isFetching && rows.length === 0 && (
            <p className="px-2 py-4 text-sm text-muted-foreground">Игроки не найдены</p>
          )}
          {isFetching && <p className="px-2 py-2 text-sm text-muted-foreground">Поиск…</p>}
          {hasNextPage && !isFetching && (
            <Button variant="ghost" size="sm" onClick={() => void fetchNextPage()}>
              Показать ещё
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
