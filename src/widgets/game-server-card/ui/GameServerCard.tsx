import React from 'react';
import Image from 'next/image';

import { DeleteGameServerDialog } from '@/features/delete-game-server';
import { EditGameServerDialog } from '@/features/edit-game-server';
import { GameServerBaseEntity } from '@/shared/api/contracts';
import { Badge } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { getProgressColor } from '@/shared/lib/utils';
import {
  formatPing,
  formatServerAddress,
  getOnlinePercent,
  getPingColorClass,
  getPingLevel,
} from '@/shared/lib/gameservers/status';
import minecraftLogo from '@/assets/logos/minecraft.png';

interface GameServerCardParams {
  profileName: string;
  server: GameServerBaseEntity;
  /** The first server of the profile: the address players have in their server list. */
  isMain?: boolean;
}

export const GameServerCard = ({ server, profileName, isMain = false }: GameServerCardParams) => {
  const progressValue = getOnlinePercent(server.online, server.maxOnline);
  const pingLevel = getPingLevel(server.isOnline, server.ping);

  return (
    <Card className="flex flex-row flex-wrap items-center justify-between gap-4 p-3 pr-8">
      <div className="flex flex-row gap-x-5 items-center">
        <Image src={minecraftLogo} className="w-16" alt="Gml Frontend" />
        <div className="flex flex-col min-w-[350px]">
          <div className="flex flex-row items-center gap-x-2">
            <span className="text-lg font-bold">{server.name}</span>
            {isMain && (
              <Badge
                variant="secondary"
                title="Этот адрес игроки видят в списке серверов Minecraft"
              >
                Основной адрес
              </Badge>
            )}
          </div>
          <span className="font-mono text-sm">
            {formatServerAddress(server.address, server.port)}
          </span>
          <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
            {server.version ?? 'Нет информации'}
          </span>
        </div>
        {server.isOnline && (
          <div>
            <div className="flex flex-row items-center justify-between gap-x-3 ml-3 relative">
              <Progress
                value={progressValue}
                className={`absolute w-full h-1 bottom-0 rounded ${getProgressColor(progressValue)}`}
              />
              <div className="flex flex-row items-center justify-between gap-x-3 relative z-2 mb-3">
                <div className="flex items-center justify-center text-sm font-medium text-muted-foreground rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition h-10 w-10">
                  {server.online ?? '—'}
                </div>
                из
                <div className="flex items-center justify-center text-sm font-medium text-muted-foreground rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition h-10 w-10">
                  {server.maxOnline ?? '—'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-x-8">
        <div className="flex flex-col items-end gap-y-0.5 min-w-24">
          <div className="flex items-center gap-x-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${server.isOnline ? 'bg-green-600' : 'bg-red-500'}`}
            />
            <span className="font-medium">{server.isOnline ? 'Онлайн' : 'Офлайн'}</span>
          </div>
          <span
            className={`text-sm font-medium tabular-nums ${getPingColorClass(pingLevel)}`}
            title="Пинг от сервера API до этого адреса на последней проверке"
          >
            {formatPing(server.isOnline, server.ping)}
          </span>
        </div>
        <EditGameServerDialog server={server} profileName={profileName} />
        <DeleteGameServerDialog serverName={server.name} profileName={profileName} />
      </div>
    </Card>
  );
};
