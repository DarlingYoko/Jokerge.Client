import { DiagnosticProblem } from '@/shared/lib/diagnostics/problems';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';

const WARNING_CLASS = 'border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-400';
const OK_CLASS = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';

type DiagnosticProblemBadgesProps = {
  problems: DiagnosticProblem[];
  className?: string;
};

export const DiagnosticProblemBadges = ({ problems, className }: DiagnosticProblemBadgesProps) => {
  if (problems.length === 0) {
    return (
      <Badge variant="outline" className={cn(OK_CLASS, className)}>
        OK
      </Badge>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {problems.map((problem) => (
        <Badge
          key={problem.code}
          title={problem.details}
          variant={problem.severity === 'error' ? 'destructive' : 'outline'}
          className={cn('whitespace-nowrap', problem.severity === 'warning' && WARNING_CLASS)}
        >
          {problem.label}
        </Badge>
      ))}
    </div>
  );
};
