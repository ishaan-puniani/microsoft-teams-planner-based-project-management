import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';

export default async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const payload = await MsTaskService.getTask(taskId);
    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
