import { getConfig } from '../../config';
import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';

export default async (req, res, next) => {
  try {
    const payload = await MsTaskService.getAllGroups();
    const autocompletePayload = payload.map((group) => ({
      id: group.id,
      label: group.displayName,
    }));
    await ApiResponseHandler.success(req, res, autocompletePayload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
