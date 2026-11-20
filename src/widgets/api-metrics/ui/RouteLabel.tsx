import { splitRoute } from '@/shared/lib/metrics/endpoints';
import { cn } from '@/shared/lib/utils';

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  POST: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  PUT: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  PATCH: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  DELETE: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export const RouteLabel = ({ route, className }: { route: string; className?: string }) => {
  const { method, path } = splitRoute(route);

  return (
    <span className={cn('flex min-w-0 items-center gap-2', className)} title={route}>
      {method && (
        <span
          className={cn(
            'w-14 shrink-0 rounded px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold',
            METHOD_COLORS[method] ?? 'bg-muted text-muted-foreground',
          )}
        >
          {method}
        </span>
      )}
      <span className={cn('truncate font-mono text-xs', !method && 'italic text-muted-foreground')}>
        {path}
      </span>
    </span>
  );
};
