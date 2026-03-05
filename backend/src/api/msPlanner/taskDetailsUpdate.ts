import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';

export default async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const { detailsEtag = '', description, checklist, references } = req.body;

    const payload = await MsTaskService.updateTaskDetailsWithEtag(taskId, detailsEtag || '', {
      description,
      checklist,
      references,
    });

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
