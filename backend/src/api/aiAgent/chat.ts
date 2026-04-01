import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';
import ProjectRepository from '../../database/repositories/projectRepository';
import ChatSessionModel from '../../database/models/chatSession';
import { createChatAgent, convertHistoryToMessages } from '../../services/aiAgent/langGraphAgent';

type ChatHistoryEntry = {
	request: { userInput: string };
	response: { success: boolean; message: string };
};

export default async function chat(req, res, next) {
	try {
		const projectId = req.params.projectId;
		const tenantId = req.params.tenantId;
		const body = req.body || {};
		const userInput = typeof body.message === 'string' ? body.message.trim() : '';
		const sessionId = body.sessionId;

		if (!projectId) {
			return ApiResponseHandler.error(req, res, new Error('projectId is required'));
		}

		if (!userInput) {
			return ApiResponseHandler.error(req, res, new Error('message (string) is required'));
		}

		const userId = req.currentUser?.id || req.userId || req.user?.id;
		if (!userId) {
			return ApiResponseHandler.error(req, res, new Error('userId is required from authentication'));
		}

		const project = await ProjectRepository.findById(projectId, req);
		const projectTitle = project?.name || 'Untitled Project';
		const projectDescription = project?.description || '';
		const workspaceLearning = req.currentTenant?.learning?.trim() || '';

		// Fetch or create chat session
		let session: any = null;
		if (sessionId) {
			const ChatSession = ChatSessionModel(req.database);
			session = await ChatSession.findById(sessionId);
		}

		// If no session found, create a new one
		if (!session) {
			const ChatSession = ChatSessionModel(req.database);
			session = new ChatSession({
				tenantId: tenantId || req.currentTenant?.id,
				tenant: tenantId || req.currentTenant?.id,
				eventUri: projectId,
				userId,
				createdBy: userId,
				data: {
					request: { userInput: '' },
					response: { success: false, message: '' },
				},
				history: [],
			});
		}

		// Build project context for the agent
		const projectContext = `Project: ${projectTitle}
Description: ${projectDescription || '(no description)'}
Workspace Context: ${workspaceLearning || '(no workspace context)'}`;

		// Create the LangGraph agent
		const agent = await createChatAgent(projectContext);

		// Convert history to chat messages
		const previousMessages = convertHistoryToMessages(session.history || []);

		// Run the agent
		try {
			const { response: reply } = await agent.invoke(userInput, previousMessages);

			if (!reply) {
				return ApiResponseHandler.error(req, res, new Error('AI returned an empty response'));
			}

			// Move current data to history if it exists
			if (session.data?.request?.userInput && session.data?.response?.message) {
				session.history = session.history || [];
				session.history.unshift({
					request: session.data.request,
					response: session.data.response,
				});
				// Keep only last 20 entries
				if (session.history.length > 20) {
					session.history = session.history.slice(0, 20);
				}
			}

			// Update current data
			session.data = {
				request: { userInput },
				response: { success: true, message: reply },
			};

			await session.save();

			// Return response in the expected contract
			const responseData = {
				success: true,
				generation: {
					_id: session._id,
					id: session._id?.toString(),
					tenantId: session.tenantId,
					tenant: session.tenant,
					eventUri: session.eventUri,
					userId: session.userId,
					createdBy: session.createdBy,
					createdAt: session.createdAt,
					updatedAt: session.updatedAt,
					__v: session.__v,
					data: session.data,
					history: session.history || [],
				},
			};

			await ApiResponseHandler.success(req, res, responseData);
		} catch (agentError) {
			console.error('LangGraph agent error:', agentError);
			return ApiResponseHandler.error(
				req,
				res,
				new Error(`Agent error: ${agentError instanceof Error ? agentError.message : String(agentError)}`),
			);
		}
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			const errData = error.response?.data;
			const errMsg =
				typeof errData === 'string'
					? errData
					: JSON.stringify(errData || error.message).slice(0, 200);
			console.error('API error:', status, errMsg);
			return ApiResponseHandler.error(
				req,
				res,
				new Error(`API error: ${status || error.code} - ${errMsg}`),
			);
		}
		await ApiResponseHandler.error(req, res, error);
	}
}