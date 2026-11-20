import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiPostSignInRequest, TPostSignUpRequest } from '@/shared/api/contracts';
import { DASHBOARD_PAGES } from '@/shared/routes';
import { enterWithNewSession } from '@/shared/lib/auth/navigation';
import { authService, getStorageProfile } from '@/shared/services';
import { isAxiosError } from '@/shared/lib/isAxiosError/isAxiosError';

export const useRegistration = () => {
  return useMutation({
    mutationKey: ['signup'],
    mutationFn: (data: TPostSignUpRequest) => authService.signUp(data),
    onSuccess: async () => {
      toast.success('Успешная регистрация', {
        description: 'Добро пожаловать в платформу',
      });

      const waitForProfile = async (timeoutMs = 1000, stepMs = 50) => {
        const start = Date.now();
        while (!getStorageProfile() && Date.now() - start < timeoutMs) {
          await new Promise((r) => setTimeout(r, stepMs));
        }
      };
      await waitForProfile();
      enterWithNewSession(DASHBOARD_PAGES.PROFILES);
    },
    onError: (error) => {
      isAxiosError({
        toast,
        error,
        customDescription: 'Ошибка сервиса авторизации. Обратитесь к администратору платформы',
      });
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationKey: ['signin'],
    mutationFn: (data: ApiPostSignInRequest) => authService.signIn(data),
    onSuccess: async () => {
      toast.success('Успешная авторизация', {
        description: 'Добро пожаловать в платформу',
      });

      const waitForProfile = async (timeoutMs = 1000, stepMs = 50) => {
        const start = Date.now();
        while (!getStorageProfile() && Date.now() - start < timeoutMs) {
          await new Promise((r) => setTimeout(r, stepMs));
        }
      };
      await waitForProfile();
      enterWithNewSession(DASHBOARD_PAGES.PROFILES);
    },
    onError: (error) => {
      isAxiosError({
        toast,
        error,
        customDescription: 'Ошибка сервиса авторизации. Обратитесь к администратору платформы',
      });
    },
  });
};
