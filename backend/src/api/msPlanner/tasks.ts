import MsTaskService, { type TaskFilterParams } from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';
import { getMsPlannerAuth } from './getMsPlannerAuth';

const parseList = (val: any): string[] =>
  val ? String(val).split(',').filter(Boolean) : [];

export default async (req, res, next) => {
  try {
    const msPlannerAuth = getMsPlannerAuth(req);
    const planId = req.params.planId;

    const filter: TaskFilterParams = {
      buckets: parseList(req.query.buckets),
      statuses: parseList(req.query.statuses) as TaskFilterParams['statuses'],
      categories: parseList(req.query.categories),
      priorities: parseList(req.query.priorities) as TaskFilterParams['priorities'],
      assignedTos: parseList(req.query.assignedTos),
      startDateFrom: req.query.startDateFrom as string | undefined,
      startDateTo: req.query.startDateTo as string | undefined,
    };

    const hasFilter =
      (filter.buckets?.length ?? 0) > 0 ||
      (filter.statuses?.length ?? 0) > 0 ||
      (filter.categories?.length ?? 0) > 0 ||
      (filter.priorities?.length ?? 0) > 0 ||
      (filter.assignedTos?.length ?? 0) > 0 ||
      !!filter.startDateFrom ||
      !!filter.startDateTo;

    const payload = hasFilter
      ? await MsTaskService.getFilteredTasksOfBoard(planId, filter, msPlannerAuth)
      : await MsTaskService.getTasksOfBoard(planId, msPlannerAuth);

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};