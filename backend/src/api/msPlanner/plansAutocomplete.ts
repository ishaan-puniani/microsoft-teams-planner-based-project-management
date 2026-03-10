import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';
import { getMsPlannerAuth } from './getMsPlannerAuth';

export default async (req, res, next) => {
  try {
    const msPlannerAuth = getMsPlannerAuth(req);
    const groupId = req.query.groupId;
    const payload = await MsTaskService.getAllPlansInGroup(groupId, msPlannerAuth);

    const autocompletePayload = payload.map((plan) => ({
      id: plan.id,
      label: plan.title,
    }));
    await ApiResponseHandler.success(req, res, autocompletePayload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
