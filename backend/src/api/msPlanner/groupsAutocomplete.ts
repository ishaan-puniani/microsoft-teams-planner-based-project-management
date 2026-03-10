import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';
import { getMsPlannerAuth } from './getMsPlannerAuth';

export default async (req, res, next) => {
  try {
    const msPlannerAuth = getMsPlannerAuth(req);
    const payload = await MsTaskService.getAllGroups(msPlannerAuth);
    const autocompletePayload = payload.map((group) => ({
      id: group.id,
      label: group.displayName,
    }));
    await ApiResponseHandler.success(req, res, autocompletePayload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
