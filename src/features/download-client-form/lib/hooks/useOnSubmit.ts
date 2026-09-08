import { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { ClientDownloadFormSchemaType } from '../static';

import { useGenerateLauncherConnectionHub } from '@/shared/hooks';

interface UseOnSubmitParams {
  connectionHub: ReturnType<typeof useGenerateLauncherConnectionHub>['connectionHub'];
  state: ReturnType<typeof useGenerateLauncherConnectionHub>['download'];
}

export const useOnSubmit = ({ connectionHub, state }: UseOnSubmitParams) => {
  const onSubmit: SubmitHandler<ClientDownloadFormSchemaType> = async (
    data: ClientDownloadFormSchemaType,
  ) => {
    try {
      state.setIsDownload(() => true);
      connectionHub?.invoke('Download', data.branch, data.host, data.folder).then(() => {});
    } catch (error: unknown) {
      toast.error('Ошибка', {
        description: JSON.stringify(error),
      });
    } finally {
      state.setPercent(0);
    }
  };

  return { onSubmit };
};
