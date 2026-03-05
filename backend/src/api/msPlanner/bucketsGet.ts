import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';

export default async (req, res, next) => {
  try {
    const planId = req.params.planId;
    const payload = await MsTaskService.getBuckets(planId);
    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
