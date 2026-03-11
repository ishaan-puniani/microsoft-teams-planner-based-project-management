import { useCallback, useEffect, useState } from 'react';
import Errors from 'src/modules/shared/error/errors';
import TaskService from 'src/modules/task/taskService';
import type { AggregateEstimates } from './estimatesConstants';

export type AggregateEstimatesPayload = {
  estimated: AggregateEstimates;
  suggestedLow: AggregateEstimates;
  suggestedIdeal: AggregateEstimates;
  suggestedHigh: AggregateEstimates;
};

export function useAggregateEstimates(projectId: string | undefined, type: string) {
  const [estimates, setEstimates] = useState<AggregateEstimates | null>(null);
  const [suggestedLow, setSuggestedLow] = useState<AggregateEstimates | null>(null);
  const [suggestedIdeal, setSuggestedIdeal] = useState<AggregateEstimates | null>(null);
  const [suggestedHigh, setSuggestedHigh] = useState<AggregateEstimates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await TaskService.getAggregateEstimates(projectId, type);
      const payload = data as AggregateEstimatesPayload;
      if (payload && 'estimated' in payload && 'suggestedIdeal' in payload) {
        setEstimates(payload.estimated);
        setSuggestedLow(payload.suggestedLow ?? null);
        setSuggestedIdeal(payload.suggestedIdeal);
        setSuggestedHigh(payload.suggestedHigh ?? null);
      } else {
        setEstimates((data as AggregateEstimates) ?? null);
        setSuggestedLow(null);
        setSuggestedIdeal(null);
        setSuggestedHigh(null);
      }
    } catch (e) {
      Errors.handle(e);
      setError((e as Error)?.message ?? 'Failed to load report');
      setEstimates(null);
      setSuggestedLow(null);
      setSuggestedIdeal(null);
      setSuggestedHigh(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, type]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { estimates, suggestedLow, suggestedIdeal, suggestedHigh, loading, error, reload: loadData };
}
