import { useCallback, useEffect, useState } from 'react';
import Errors from 'src/modules/shared/error/errors';
import TaskService from 'src/modules/task/taskService';
import type { AggregateEstimates } from './estimatesConstants';

export function useAggregateEstimates(projectId: string | undefined, type: string) {
  const [estimates, setEstimates] = useState<AggregateEstimates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await TaskService.getAggregateEstimates(projectId, type);
      setEstimates(data as AggregateEstimates);
    } catch (e) {
      Errors.handle(e);
      setError((e as Error)?.message ?? 'Failed to load report');
      setEstimates(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, type]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { estimates, loading, error, reload: loadData };
}
