import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';
import { getMsPlannerAuth } from './getMsPlannerAuth';

export default async (req, res, next) => {
  try {
    const msPlannerAuth = getMsPlannerAuth(req);
    const taskId = req.params.taskId;
    const {
      destinationPlanId,
      destinationBucketId,
      deleteSourceTask = true,
      copyDetails = true,
    } = req.body;

    if (!destinationPlanId || !destinationBucketId) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('destinationPlanId and destinationBucketId are required'),
      );
    }

    const payload = await MsTaskService.moveTaskToPlan(
      taskId,
      {
        destinationPlanId,
        destinationBucketId,
        deleteSourceTask,
        copyDetails,
      },
      msPlannerAuth,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
