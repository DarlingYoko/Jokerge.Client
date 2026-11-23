import { FileIcon } from '@radix-ui/react-icons';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ModBaseEntity, ModDetailsEntity } from '@/shared/api/contracts/mods/schemas';
import { TableCell } from '@/shared/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Form, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import {
  ModDetailsEntitySchema,
  ModDetailsEntitySchemaType,
  ProfileExtendedBaseEntity,
} from '@/shared/api/contracts';
import { useRemoveProfileMod } from '@/shared/hooks';
import { usePutModDetails } from '@/shared/hooks/useMods';
import { MultiSelect } from '@/shared/ui/multi-select';
import { dependencyOptions, modKey, requiredBy } from '@/shared/lib/mods/dependencies';

interface GameModItemType {
  mod: ModBaseEntity;
  profile: ProfileExtendedBaseEntity;
  details: Record<string, ModDetailsEntity>;
  /** All optional mods of the profile: the ones this mod may depend on. */
  optionalMods: ModBaseEntity[];
}

export const GameModItem = ({ mod, profile, details, optionalMods }: GameModItemType) => {
  const { mutateAsync: removeModMutate } = useRemoveProfileMod();
  const { mutateAsync: putModMutate } = usePutModDetails();

  const key = modKey(mod.name);
  const saved = details[key];
  const options = dependencyOptions(optionalMods, details, key);
  const neededBy = requiredBy(optionalMods, details, key);

  const form = useForm<ModDetailsEntitySchemaType>({
    resolver: zodResolver(ModDetailsEntitySchema),
    defaultValues: {
      title: saved?.title ?? '',
      description: saved?.description ?? '',
      dependencies: saved?.dependencies ?? [],
    },
  });

  const removeMod = async (fileName: string) => {
    await removeModMutate({ profileName: profile.profileName, modName: fileName });
  };

  const onSubmit: SubmitHandler<ModDetailsEntitySchemaType> = async (
    body: ModDetailsEntitySchemaType,
  ) => {
    await putModMutate({
      key,
      title: body.title,
      description: body.description,
      dependencies: body.dependencies,
    });
    form.reset(body);
  };

  return (
    <>
      <TableCell>
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <Avatar className="hidden md:flex w-8 h-8">
              <AvatarImage src={mod?.iconUrl} alt="@shadcn" />
              <AvatarFallback>
                <FileIcon />
              </AvatarFallback>
            </Avatar>
            {mod?.name}
            <Badge className="hidden md:flex bg-orange-500 bg-opacity-20 text-orange-500 hover:bg-opacity-100 hover:bg-orange-500 hover:text-white">
              Jar
            </Badge>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="border-l border-dashed ml-4">
                <div className="flex items-center gap-2 mt-3">
                  <div className="border-t border-dashed w-[20px] h-[1px]"></div>
                  <h3 className="text-gray-700 dark:text-gray-300">Наименование</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[20px] h-[1px]"></div>
                  <Input
                    className=" p-0 text-md text-black dark:text-white bg-transparent shadow-none border-none"
                    style={{ boxShadow: 'none' }}
                    type="text"
                    {...form.register('title')}
                    placeholder="Введите наименование"
                  />
                  {form.formState.errors.title && (
                    <FormMessage>{form.formState.errors.title.message?.toString()}</FormMessage>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="border-t border-dashed w-[20px] h-[1px]"></div>
                  <h3 className="text-gray-700 dark:text-gray-300">Описание</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[20px] h-[1px]"></div>
                  <Textarea
                    className="p-0 pt-2 text-md text-black dark:text-white bg-transparent shadow-none border-none"
                    style={{ boxShadow: 'none' }}
                    {...form.register('description')}
                    placeholder="Введите описание"
                  />
                  {form.formState.errors.description && (
                    <FormMessage>
                      {form.formState.errors.description.message?.toString()}
                    </FormMessage>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="border-t border-dashed w-[20px] h-[1px]"></div>
                  <h3 className="text-gray-700 dark:text-gray-300">Зависимости</h3>
                </div>
                <div className="flex flex-col gap-1 pl-7 pr-2">
                  <Controller
                    control={form.control}
                    name="dependencies"
                    render={({ field }) => (
                      <MultiSelect
                        options={options}
                        onValueChange={(value) => field.onChange(value)}
                        defaultValue={field.value}
                        placeholder={
                          options.length > 0 ? 'Нет зависимостей' : 'Нет других опциональных модов'
                        }
                        disabled={options.length === 0 && field.value.length === 0}
                        maxCount={3}
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Включаются в лаунчере вместе с этим модом, игрок не может их выключить.
                  </p>
                  {neededBy.length > 0 && (
                    <p className="text-xs text-muted-foreground">Нужен для: {neededBy.join(', ')}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[10px] h-[1px]"></div>
                  <Button
                    variant="link"
                    disabled={form.formState.disabled || !form.formState.isDirty}
                  >
                    Сохранить
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </TableCell>
      <TableCell>
        <Button variant="link" onClick={() => removeMod(`${mod?.name}.jar`)}>
          Удалить
        </Button>
      </TableCell>
    </>
  );
};
