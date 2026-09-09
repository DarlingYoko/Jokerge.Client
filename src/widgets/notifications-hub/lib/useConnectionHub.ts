import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

import { getApiBaseUrl } from '@/shared/lib/utils';
import { useNotificationsState } from '@/shared/store/notificationsStore';
import { NotificationBaseEntity } from '@/shared/api/contracts';
import { useNotifications } from '@/shared/hooks';

// The access token rides along as an httpOnly cookie (withCredentials below), not a query
// param — the browser attaches it automatically, JS never sees the value.
const CONNECTION_URL = () => `${getApiBaseUrl()}/ws/notifications`;

export const useConnectionHub = () => {
  const { addNotification, addCount, setNotifications, setCount } = useNotificationsState();

  const { data, isLoading } = useNotifications();

  useEffect(() => {
    if (data) {
      setCount(data.amount);
      setNotifications(data.notifications);
    }
  }, [data]);

  const [connectionHub, setConnectionHub] = useState<HubConnection | null>(null);

  useEffect(() => {
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

        connection.on('Notifications', (notification: NotificationBaseEntity) => {
          const { details, message } = notification;
          addCount();
          addNotification(notification);
          toast.error(message, {
            description: details && `${details?.substring(0, 50)}...`,
            action: {
              label: 'Копировать',
              onClick: async () => {
                await navigator.clipboard.writeText(details ? details : message);
                toast('Текст успешно скопирован', { duration: 500, onAutoClose: () => true });
              },
            },
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
};
