'use client';

import { useState } from 'react';

import { SentryExceptionInfo } from '@/shared/api/contracts/sentry/schemas';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

const VISIBLE_FRAMES = 25;

type SentryStackTraceProps = {
  exceptions: SentryExceptionInfo[];
};

/**
 * Outer exception first, crashing frame first. Frames from our own code are highlighted: that is
 * usually where the fix goes; .NET and library frames are dimmed.
 */
export const SentryStackTrace = ({ exceptions }: SentryStackTraceProps) => {
  const [showAll, setShowAll] = useState(false);

  const total = exceptions.reduce((sum, e) => sum + e.frames.length, 0);
  let budget = showAll ? Number.POSITIVE_INFINITY : VISIBLE_FRAMES;

  return (
    <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed overflow-x-auto">
      {exceptions.length === 0 && <p className="text-muted-foreground">Стек не передан</p>}
      {exceptions.map((exception, index) => {
        const frames = exception.frames.slice(0, Math.max(0, budget));
        budget -= frames.length;

        return (
          <div key={`${exception.type}-${index}`} className={cn(index > 0 && 'mt-3')}>
            <p className="whitespace-pre-wrap break-words">
              {index > 0 && <span className="text-muted-foreground">{'---> '}</span>}
              <span className="font-semibold text-red-500 dark:text-red-400">{exception.type}</span>
              {exception.message && <span>: {exception.message}</span>}
            </p>
            {frames.map((frame, frameIndex) => (
              <p
                key={frameIndex}
                className={cn(
                  'pl-4 whitespace-pre-wrap break-all',
                  frame.inApp ? 'text-foreground' : 'text-muted-foreground/70',
                )}
              >
                at {frame.function}
                {frame.file && (
                  <span className="text-muted-foreground">
                    {' '}
                    — {frame.file}
                    {frame.line ? `:${frame.line}` : ''}
                  </span>
                )}
              </p>
            ))}
          </div>
        );
      })}
      {total > VISIBLE_FRAMES && (
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0 mt-2"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? 'Свернуть стек' : `Показать весь стек (${total} кадров)`}
        </Button>
      )}
    </div>
  );
};
