'use client';

import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { toast } from 'sonner';

import { getApiBaseUrl } from '@/shared/lib/utils';

// The access token rides along as an httpOnly cookie (withCredentials below), not a query
// param — the browser attaches it automatically, JS never sees the value.
const CONNECTION_URL = () => `${getApiBaseUrl()}/ws/launcher/build`;

export const useGenerateLauncherConnectionHub = () => {
  const [connectionHub, setConnectionHub] = useState<HubConnection | null>(null);

  const [logsBuilding, setLogsBuilding] = useState<string[] | null>(null);

  const [percentDownload, setPercentDownload] = useState(0);

  const [isDownload, setIsDownload] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleDownloadEnded = () => {
    setIsDownload(false);
  };

  const handleBuildingEnded = () => {
    setIsBuilding(false);
  };

  useEffect(() => {
    let connection: HubConnection | undefined;

    const onConnectedHub = async () => {
      try {
        connection = new HubConnectionBuilder()
          .withUrl(CONNECTION_URL(), {
            withCredentials: true,
          })
          .withAutomaticReconnect()
          .build();
        setConnectionHub(connection);

        await connection.start();

        connection.on('GitHubLauncherHubChangeProgress', (percent) => {
          setPercentDownload(percent);
        });

        connection.on('Message', (message) => {
          toast.info('Информация', {
            description: message,
          });
        });

        connection.on('LauncherDownloadEnded', handleDownloadEnded);
        connection.on('LauncherBuildEnded', handleBuildingEnded);
        connection.on('LauncherPublishEnded', handleDownloadEnded);

        connection.on('Log', (log: string) => {
          setLogsBuilding((prev) => (prev ? [...prev, log] : [log]));
        });
      } catch (error) {
        console.log(error);
      }
    };

    onConnectedHub().then(() => {
      console.log('Success starting connectionHub');
    });

    return () => {
      connection?.stop().then(() => {
        console.log('Success stopping connectionHub');
      });
    };
  }, []);

  return {
    connectionHub,
    download: {
      isDownload,
      setIsDownload,
      percent: percentDownload,
      setPercent: setPercentDownload,
    },
    build: {
      isBuilding,
      setIsBuilding,
      logs: logsBuilding,
      setLogs: setLogsBuilding,
    },
  };
};
