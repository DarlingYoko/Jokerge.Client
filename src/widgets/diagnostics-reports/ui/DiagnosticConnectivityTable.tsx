import { DiagnosticConnectivity } from '@/shared/api/contracts/diagnostics/schemas';
import { connectivityLabel, formatLatency } from '@/shared/lib/diagnostics/format';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

export const DiagnosticConnectivityTable = ({ probes }: { probes: DiagnosticConnectivity[] }) => {
  if (probes.length === 0) {
    return <p className="text-sm text-muted-foreground">Проверки связи не выполнялись</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Проверка</TableHead>
            <TableHead>Состояние</TableHead>
            <TableHead className="text-right">Задержка</TableHead>
            <TableHead className="text-right">Код</TableHead>
            <TableHead>Ошибка</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {probes.map((probe) => (
            <TableRow key={`${probe.name}:${probe.target}`}>
              <TableCell>
                <div className="font-medium">{connectivityLabel(probe.name)}</div>
                <div className="break-all font-mono text-xs text-muted-foreground">
                  {probe.target}
                </div>
              </TableCell>
              <TableCell>
                {probe.reachable ? (
                  <Badge variant="secondary">Доступен</Badge>
                ) : (
                  <Badge variant="destructive">Недоступен</Badge>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatLatency(probe.latencyMs)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{probe.statusCode ?? '—'}</TableCell>
              <TableCell className="max-w-xs break-words text-sm text-muted-foreground">
                {probe.error ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
