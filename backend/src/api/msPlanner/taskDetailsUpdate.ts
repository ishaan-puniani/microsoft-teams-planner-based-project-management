import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';
import { getMsPlannerAuth } from './getMsPlannerAuth';

export default async (req, res, next) => {
  try {
    const msPlannerAuth = getMsPlannerAuth(req);
    const taskId = req.params.taskId;
    const { detailsEtag = '', description, checklist, references } = req.body;

    const payload = await MsTaskService.updateTaskDetailsWithEtag(taskId, detailsEtag || '', {
      description,
      checklist,
      references,
    }, msPlannerAuth);

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
