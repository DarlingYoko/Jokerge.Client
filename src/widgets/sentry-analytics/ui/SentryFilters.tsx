'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, Search } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { ProjectTypeEnum } from '@/shared/enums';
import { SentryIssueSort } from '@/shared/lib/sentry/issues';
import { SENTRY_PERIOD_LABELS, SentryPeriod } from '@/shared/lib/sentry/period';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Input } from '@/shared/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

const SORT_LABELS: Record<SentryIssueSort, string> = {
  count: 'Чаще всего',
  recent: 'Свежие',
  users: 'Больше устройств',
};

// "Профили" exists in the enum but nothing ever reports with it.
const PROJECTS: { value: ProjectTypeEnum; label: string }[] = [
  { value: ProjectTypeEnum.All, label: 'Все источники' },
  { value: ProjectTypeEnum.Launcher, label: 'Лаунчер' },
  { value: ProjectTypeEnum.Backend, label: 'Бэкенд' },
];

export type SentryFiltersValue = {
  period: SentryPeriod;
  custom: DateRange | undefined;
  projectType: ProjectTypeEnum;
  search: string;
  sort: SentryIssueSort;
};

type SentryFiltersProps = {
  value: SentryFiltersValue;
  onChange: (value: SentryFiltersValue) => void;
};

const formatRange = (range: DateRange | undefined) => {
  if (!range?.from) return 'Выберите даты';
  const from = format(range.from, 'd MMM yyyy', { locale: ru });
  if (!range.to || range.to.getTime() === range.from.getTime()) return from;
  return `${from} — ${format(range.to, 'd MMM yyyy', { locale: ru })}`;
};

export const SentryFilters = ({ value, onChange }: SentryFiltersProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const set = (patch: Partial<SentryFiltersValue>) => onChange({ ...value, ...patch });

  const handlePeriod = (period: string) => {
    set({ period: period as SentryPeriod });
    if (period === SentryPeriod.Custom && !value.custom?.from) setCalendarOpen(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={value.period} onValueChange={handlePeriod}>
          <TabsList className="h-auto flex-wrap justify-start">
            {Object.values(SentryPeriod).map((period) => (
              <TabsTrigger key={period} value={period}>
                {SENTRY_PERIOD_LABELS[period]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {value.period === SentryPeriod.Custom && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start font-normal',
                  !value.custom?.from && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatRange(value.custom)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                locale={ru}
                weekStartsOn={1}
                defaultMonth={value.custom?.from}
                selected={value.custom}
                onSelect={(custom) => set({ custom })}
                disabled={{ after: new Date() }}
                numberOfMonths={2}
              />
              <p className="px-3 pb-3 text-xs text-muted-foreground">
                Выберите один день или начало и конец периода. Дни включаются целиком.
              </p>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Поиск по тексту ошибки, игроку, компьютеру или версии"
            value={value.search}
            onChange={(event) => set({ search: event.target.value })}
          />
        </div>
        <Select
          value={String(value.projectType)}
          onValueChange={(type) => set({ projectType: Number(type) as ProjectTypeEnum })}
        >
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECTS.map((project) => (
              <SelectItem key={project.value} value={String(project.value)}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={value.sort} onValueChange={(sort) => set({ sort: sort as SentryIssueSort })}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SentryIssueSort[]).map((sort) => (
              <SelectItem key={sort} value={sort}>
                {SORT_LABELS[sort]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
