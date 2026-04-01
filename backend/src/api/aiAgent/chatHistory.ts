import ApiResponseHandler from '../apiResponseHandler';
import ChatSessionModel from '../../database/models/chatSession';

export const chatHistory = async (req, res) => {
	try {
		const projectId = req.params.projectId;
		const tenantId = req.params.tenantId || req.currentTenant?.id;

		if (!projectId) {
			return ApiResponseHandler.error(req, res, new Error('projectId is required'));
		}

		if (!tenantId) {
			return ApiResponseHandler.error(req, res, new Error('tenantId is required'));
		}

		const ChatSession = ChatSessionModel(req.database);
		const session = await ChatSession.findOne({
			eventUri: projectId,
			tenant: tenantId,
		})
			.sort({ updatedAt: -1 })
			.lean();

		return ApiResponseHandler.success(req, res, {
			success: true,
			generation: session || null,
		});
	} catch (error) {
		return ApiResponseHandler.error(req, res, error);
	}
};