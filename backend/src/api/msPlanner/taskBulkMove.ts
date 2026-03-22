import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';
import { getMsPlannerAuth } from './getMsPlannerAuth';

export default async (req, res, next) => {
  try {
    const msPlannerAuth = getMsPlannerAuth(req);
    const {
      taskIds,
      destinationPlanId,
      destinationBucketId,
      deleteSourceTask = true,
      copyDetails = true,
      continueOnError = true,
    } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return ApiResponseHandler.error(req, res, new Error('taskIds must be a non-empty array'));
    }

    if (!destinationPlanId || !destinationBucketId) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('destinationPlanId and destinationBucketId are required'),
      );
    }

    const payload = await MsTaskService.moveTasksToPlan(
      taskIds,
      {
        destinationPlanId,
        destinationBucketId,
        deleteSourceTask,
        copyDetails,
        continueOnError,
      },
      msPlannerAuth,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
