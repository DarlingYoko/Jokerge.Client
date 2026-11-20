import { toast } from 'sonner';

export const copyToClipboard = async (text: string, what = 'Текст'): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} скопирован`, { duration: 1500 });
  } catch (error) {
    console.error(error);
    toast.error('Не удалось скопировать. Подробности в консоли браузера');
  }
};
