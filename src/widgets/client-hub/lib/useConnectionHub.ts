import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { JavaVersionBaseEntity, ProfileExtendedBaseEntity } from '@/shared/api/contracts';
import { getApiBaseUrl } from '@/shared/lib/utils';
import { useProfileCardStore } from '@/shared/store/profileCardStore';
import { EntityState } from '@/shared/enums';
import { profileKeys } from '@/shared/hooks/useProfiles';

interface ConnectionHubProps {
  profile?: ProfileExtendedBaseEntity;
  isLoading?: boolean;
}

// The access token rides along as an httpOnly cookie (withCredentials below), not a query
// param — the browser attaches it automatically, JS never sees the value.
const CONNECTION_URL = () => `${getApiBaseUrl()}/ws/profiles/restore`;

export const useConnectionHub = (props: ConnectionHubProps) => {
  const { profile, isLoading } = props;

  const [connectionHub, setConnectionHub] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [percentStage, setPercentStage] = useState(0);
  const [percentAllStages, setPercentAllStages] = useState(0);

  const [isRestoring, setIsRestoring] = useState(false);

  const [logs, setLogs] = useState<string[] | null>(null);

  const [isPacked, setIsPacked] = useState(false);

  const { setState: setProfileCardState } = useProfileCardStore();
  const queryClient = useQueryClient();

  // The profile badge is normally kept in sync by the SignalR push events below, but that push
  // can be missed entirely (connection dropped mid-build, tab switched away and this component
  // unmounted, a proxy idle-timeout, etc.), leaving the badge stuck on a stale state forever even
  // though the server finished. Re-pulling the real profile state from the REST API is a
  // failure-tolerant backstop that self-corrects regardless of what happened to the socket.
  const resyncProfile = () => {
    if (profile?.profileName) {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(profile.profileName) });
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const onConnectedHub = async () => {
      try {
        const connection = new HubConnectionBuilder()
          .withUrl(CONNECTION_URL(), {
            withCredentials: true,
          })
          .withAutomaticReconnect()
          .build();
        setConnectionHub(connection);

        await connection.start();

        if (connection.state == 'Connected') setIsConnected(true);

        // Correct any staleness accumulated while this connection wasn't around to receive the
        // completion event (e.g. the user was away from this tab while a build finished).
        resyncProfile();

        if (profile?.hasUpdate == false) setIsRestoring(true);

        connection.on('ChangeProgress', (profileName, percent) => {
          setIsConnected(true);
          if (profileName == profile?.profileName) {
            setIsPacked(true);
            setIsRestoring(true);
            setPercentStage(percent);
          }
        });

        connection.on('FullProgress', (profileName, percent) => {
          setIsConnected(true);
          if (profileName == profile?.profileName) {
            setIsRestoring(true);
            setIsPacked(true);
            setPercentAllStages(percent);
          }
        });

        connection.on('OnException', (profileName, exception: string) => {
          setIsConnected(true);
          if (profileName == profile?.profileName) {
            setLogs((prev) => (prev ? [...prev, exception] : [exception]));
          }
        });

        connection.on('Log', (profileName, log: string) => {
          setIsConnected(true);
          if (profileName == profile?.profileName) {
            setLogs((prev) => (prev ? [...prev, log] : [log]));
          }
        });

        connection.on('Message', (msg) => {
          setIsConnected(true);
          toast.error('Ошибка', {
            description: msg,
          });
        });

        connection.on('SuccessInstalled', (profileName) => {
          setIsConnected(true);
          if (profileName == profile?.profileName) {
            setProfileCardState(EntityState.ENTITY_STATE_ACTIVE);
            setIsPacked(false);
            setIsRestoring(false);
            setPercentStage(0);
            setPercentAllStages(0);
            setLogs(null);
            resyncProfile();
            toast.success('Успешно', {
              description: `Профиль ${profileName} успешно загружен`,
            });
          }
        });

        connection.on('SuccessPacked', (profileName) => {
          setIsConnected(true);
          if (profileName == profile?.profileName) {
            setProfileCardState(EntityState.ENTITY_STATE_ACTIVE);
            setIsRestoring(false);
            setPercentStage(0);
            setLogs(null);
            resyncProfile();
          }

          toast.success('Успешно', {
            description: `Профиль ${profileName} успешно собран`,
          });
        });
      } catch (error) {
        console.log(error);
      }
    };

    onConnectedHub().then().catch();

    return () => {
      connectionHub?.stop().then().catch();
    };
  }, []);

  const onDownloadDistributive = () => {
    setIsPacked(true);
    setIsRestoring(true);
    setProfileCardState(EntityState.ENTITY_STATE_LOADING);
    connectionHub
      ?.invoke('Restore', profile?.profileName)
      .then(() => {
        setIsConnected(true);
      })
      .catch((error) => {
        toast.error('Ошибка', {
          description: JSON.stringify(error),
        });

        if (profile) {
          setProfileCardState(profile.state);
        }
      })
      .finally(() => {
        setIsRestoring(false);
        setProfileCardState(EntityState.ENTITY_STATE_NEED_COMPILE);
        resyncProfile();
      });
  };

  const onDownloadJavaDistributive = (javaVersion: JavaVersionBaseEntity) => {
    setIsPacked(true);
    setIsRestoring(true);
    setProfileCardState(EntityState.ENTITY_STATE_LOADING);
    connectionHub
      ?.invoke('RestoreAndChangeBootstrapVersion', profile?.profileName, javaVersion)
      .then(() => {
        setIsConnected(true);
      })
      .catch((error) => {
        toast.error('Ошибка', {
          description: JSON.stringify(error),
        });

        if (profile) {
          setProfileCardState(profile.state);
        }
      })
      .finally(() => {
        setIsRestoring(false);
        setProfileCardState(EntityState.ENTITY_STATE_LOADING);
        resyncProfile();
      });
  };

  const onBuildDistributive = () => {
    setIsPacked(false);
    setIsRestoring(true);
    setProfileCardState(EntityState.ENTITY_STATE_PACKING);
    connectionHub
      ?.invoke('Build', profile?.profileName)
      .then(() => {
        setIsConnected(true);
      })
      .catch((error) => {
        toast.error('Ошибка', {
          description: JSON.stringify(error),
        });

        if (profile) {
          setProfileCardState(profile.state);
          setProfileCardState(EntityState.ENTITY_STATE_LOADING);
        }
      })
      .finally(() => {
        setProfileCardState(EntityState.ENTITY_STATE_ACTIVE);
        setIsRestoring(false);
        resyncProfile();
      });
  };

  return {
    onDownloadDistributive,
    onDownloadJavaDistributive,
    onBuildDistributive,
    isDisable: isRestoring,
    isConnected,
    isPacked,
    percentStage,
    percentAllStages,
    logs,
  };
};
