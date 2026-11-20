'use client';

import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Icons } from '@/shared/ui/icons';
import { useProfiles } from '@/shared/hooks/useProfiles';
import { useSaveNews } from '@/shared/hooks/useNews';
import {
  NewsFormSchema,
  NewsFormSchemaType,
  PanelNewsEntity,
} from '@/shared/api/contracts/news/schemas';
import { NO_PROFILE, toNewsFormValues, toNewsRequest } from '@/shared/lib/news/news';

type NewsFormDialogProps = {
  /** Post to edit; omitted to create a new one. */
  news?: PanelNewsEntity;
  trigger: React.ReactNode;
};

export const NewsFormDialog = ({ news, trigger }: NewsFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const isEdit = news !== undefined;

  const form = useForm<NewsFormSchemaType>({
    resolver: zodResolver(NewsFormSchema),
    defaultValues: toNewsFormValues(news),
  });

  const { data: profiles } = useProfiles();
  const { mutateAsync, isPending } = useSaveNews();

  const profileNames = (profiles ?? []).map((profile) => profile.name);
  // A post may point to a profile that was renamed or removed since; keep it selectable.
  if (news?.profileName && !profileNames.includes(news.profileName)) {
    profileNames.push(news.profileName);
  }

  const onOpenChange = (next: boolean) => {
    if (next) form.reset(toNewsFormValues(news));
    setOpen(next);
  };

  const onSubmit: SubmitHandler<NewsFormSchemaType> = async (values) => {
    await mutateAsync({ id: news?.id, body: toNewsRequest(values) });
    setOpen(false);
  };

  const { errors } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактирование новости' : 'Новая новость'}</DialogTitle>
          <DialogDescription>
            Новость сразу появится на главной странице лаунчера у всех игроков.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormItem>
              <FormLabel>Заголовок</FormLabel>
              <FormControl>
                <Input placeholder="Например: Вайп сервера 1 декабря" {...form.register('title')} />
              </FormControl>
              {errors.title && <FormMessage>{errors.title.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel>Текст (Markdown)</FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className="font-mono text-sm"
                  placeholder={'**Жирный**, *курсив*, [ссылка](https://...)\n\n- пункт списка'}
                  {...form.register('content')}
                />
              </FormControl>
              {errors.content && <FormMessage>{errors.content.message}</FormMessage>}
            </FormItem>

            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="profileName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Профиль</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Для всех" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_PROFILE}>Для всех</SelectItem>
                        {profileNames.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Версия сборки</FormLabel>
                <FormControl>
                  <Input placeholder="Необязательно" {...form.register('buildVersion')} />
                </FormControl>
                {errors.buildVersion && <FormMessage>{errors.buildVersion.message}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Дата</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...form.register('date')} />
                </FormControl>
                {errors.date && <FormMessage>{errors.date.message}</FormMessage>}
              </FormItem>
            </div>

            <div className="flex justify-end">
              <Button disabled={isPending}>
                {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Сохранить' : 'Опубликовать'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
