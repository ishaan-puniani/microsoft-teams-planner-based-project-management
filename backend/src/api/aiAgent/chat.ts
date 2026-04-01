import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';
import ProjectRepository from '../../database/repositories/projectRepository';
import ChatSessionModel from '../../database/models/chatSession';
import { createChatAgent, convertHistoryToMessages } from '../../services/aiAgent/langGraphAgent';

type ChatHistoryEntry = {
	request: { userInput: string };
	response: {
		success: boolean;
		message: string;
		error?: string | null;
		suggestedTasksType?: string | null;
		suggestedTasks?: Array<{ id: string; name: string; description?: string; type?: string }>;
	};
	tokensUsed?: number;
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
					response: {
						success: false,
						message: '',
						error: null,
						suggestedTasksType: null,
						suggestedTasks: [],
					},
					tokensUsed: 0,
				},
				history: [],
			});
		}

		// Build project context for the agent
		const projectContext = `Project: ${projectTitle}
Description: ${projectDescription || '(no description)'}
Workspace Context: ${workspaceLearning || '(no workspace context)'}`;

		const forwardedHeaders: Record<string, string> = {};
		if (typeof req.headers.authorization === 'string') {
			forwardedHeaders.authorization = req.headers.authorization;
		}
		if (typeof req.headers.cookie === 'string') {
			forwardedHeaders.cookie = req.headers.cookie;
		}

		const config = getConfig();
		const internalBaseURL =
			typeof config.INTERNAL_API_BASE_URL === 'string' && config.INTERNAL_API_BASE_URL.trim()
				? config.INTERNAL_API_BASE_URL.trim()
				: null;
		const fallbackPort = config.PORT || 9080;
		const baseURL = internalBaseURL || `http://localhost:${fallbackPort}`;

		const effectiveTenantId = String(tenantId || req.currentTenant?.id || '').trim();
		if (!effectiveTenantId) {
			return ApiResponseHandler.error(req, res, new Error('tenantId is required'));
		}

		// Create the LangGraph agent
		const agent = await createChatAgent(projectContext, {
			baseURL,
			tenantId: effectiveTenantId,
			headers: forwardedHeaders,
			projectId,
		});

		// Convert history to chat messages
		const previousMessages = convertHistoryToMessages(session.history || []);

		// Run the agent
		try {
			const previousSuggestedTasks = Array.isArray(session?.data?.response?.suggestedTasks)
				? session.data.response.suggestedTasks
				: [];
			const { response: reply, tokensUsed, debugTrace, suggestions } = await agent.invoke(
				userInput,
				previousMessages,
				previousSuggestedTasks,
			);

			const toolErrorMatch = reply.match(/Tool\s+\w+\s+error:\s*([\s\S]+)/i);
			const toolError = toolErrorMatch ? toolErrorMatch[1].trim() : null;

			if (!reply) {
				return ApiResponseHandler.error(req, res, new Error('AI returned an empty response'));
			}

			// Move current data to history if it exists
			if (session.data?.request?.userInput) {
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
				response: {
					success: !toolError,
					message: reply,
					error: toolError,
					suggestedTasksType: suggestions?.suggestedTasksType || null,
					suggestedTasks: suggestions?.suggestedTasks || [],
				},
				tokensUsed: Number(tokensUsed || 0),
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
				suggestedTasks: session.data?.response?.suggestedTasks || [],
				suggestedTasksType: session.data?.response?.suggestedTasksType || null,
				debug: {
					toolTrace: debugTrace || [],
				},
			};

			await ApiResponseHandler.success(req, res, responseData);
		} catch (agentError) {
			console.error('LangGraph agent error:', agentError);

			const agentErrorMessage = agentError instanceof Error ? agentError.message : String(agentError);

			if (session && userInput) {
				if (session.data?.request?.userInput) {
					session.history = session.history || [];
					session.history.unshift({
						request: session.data.request,
						response: session.data.response,
					});
					if (session.history.length > 20) {
						session.history = session.history.slice(0, 20);
					}
				}

				session.data = {
					request: { userInput },
					response: {
						success: false,
						message: 'Agent failed to process the request.',
						error: agentErrorMessage,
						suggestedTasksType: null,
						suggestedTasks: [],
					},
					tokensUsed: 0,
				};

				await session.save();

				return ApiResponseHandler.success(req, res, {
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
					suggestedTasks: [],
					suggestedTasksType: null,
					debug: {
						toolTrace: [],
						agentError: agentErrorMessage,
					},
				});
			}

			return ApiResponseHandler.error(req, res, new Error(`Agent error: ${agentErrorMessage}`));
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