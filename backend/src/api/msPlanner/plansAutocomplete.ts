import { getConfig } from '../../config';
import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';

export default async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    const payload = await MsTaskService.getAllPlansInGroup(groupId);

    const autocompletePayload = payload.map((plan) => ({
      id: plan.id,
      label: plan.title,
    }));
    await ApiResponseHandler.success(req, res, autocompletePayload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
