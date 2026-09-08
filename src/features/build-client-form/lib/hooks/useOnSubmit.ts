import { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { ClientBuildFormSchemaType } from '../static';

import { useGenerateLauncherConnectionHub } from '@/shared/hooks';

interface UseOnSubmitBuildParams {
  connectionHub: ReturnType<typeof useGenerateLauncherConnectionHub>['connectionHub'];
  state: ReturnType<typeof useGenerateLauncherConnectionHub>['build'];
  version: string;
}

export const useOnSubmit = ({ connectionHub, state, version }: UseOnSubmitBuildParams) => {
  const onSubmit: SubmitHandler<ClientBuildFormSchemaType> = async (
    data: ClientBuildFormSchemaType,
  ) => {
    try {
      state.setIsBuilding(() => true);
      connectionHub?.invoke('Compile', version, data.operatingSystem).then(() => {});
    } catch (error: unknown) {
      toast.error('Ошибка', {
        description: JSON.stringify(error),
      });
    } finally {
      state.setLogs(null);
    }
  };
  return { onSubmit };
};
