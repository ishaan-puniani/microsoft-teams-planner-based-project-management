import axios from 'axios';
import { getConfig } from '../../config';

/**
 * Tool definitions that wrap existing API endpoints for project planning
 */

export interface Tool {
	name: string;
	description: string;
	schema?: any;
	invoke: (input: any) => Promise<string>;
}

export interface ToolContext {
	baseURL?: string;
	tenantId: string;
	headers?: Record<string, string>;
	projectId?: string;
}

function resolveBaseURL(context: ToolContext): string {
	if (context.baseURL) {
		return context.baseURL;
	}

	const config = getConfig();
	if (config.API_URL) {
		return config.API_URL;
	}

	const port = config.PORT || 9080;
	return `http://localhost:${port}`;
}

function resolveApiBaseURL(context: ToolContext): string {
	const raw = resolveBaseURL(context).trim().replace(/\/+$/, '');
	if (/\/api$/i.test(raw)) {
		return raw;
	}
	return `${raw}/api`;
}

function formatToolError(error: any): string {
	if (error?.response?.data) {
		const data =
			typeof error.response.data === 'string'
				? error.response.data
				: JSON.stringify(error.response.data);
		return `HTTP ${error.response.status}: ${data}`;
	}

	return error?.message || String(error);
}

function buildAxiosConfig(context: ToolContext) {
	return {
		headers: context.headers || {},
		timeout: 60000,
	};
}

export function createTools(context: ToolContext): Tool[] {
	const baseURL = resolveApiBaseURL(context);
	const tenantId = context.tenantId;

	const suggestEpicsTool: Tool = {
		name: 'suggest_epics',
		description: 'Suggests epics for a project based on a brief description. Returns a list of epic names and descriptions.',
		invoke: async (input: { projectBrief: string; projectId?: string }) => {
			const endpoint = `${baseURL}/tenant/${tenantId}/ai-agent/planner-suggest-epics`;
			try {
				const response = await axios.post(
					endpoint,
					{
						projectBrief: input.projectBrief,
						projectId: input.projectId || context.projectId,
					},
					buildAxiosConfig(context),
				);
				return JSON.stringify(response.data);
			} catch (error: any) {
				throw new Error(`suggest_epics failed (${endpoint}): ${formatToolError(error)}`);
			}
		},
	};

	const suggestUserStoriesTool: Tool = {
		name: 'suggest_user_stories',
		description:
			'Suggests user stories for a specific epic. Returns a list of user story titles and descriptions.',
		invoke: async (input: {
			epicName: string;
			projectBrief?: string;
			epicDescription?: string;
			projectId?: string;
		}) => {
			const endpoint = `${baseURL}/tenant/${tenantId}/ai-agent/planner-suggest-user-story-for-epic`;
			try {
				const response = await axios.post(
					endpoint,
					{
						epicName: input.epicName,
						projectBrief: input.projectBrief,
						epicDescription: input.epicDescription,
						projectId: input.projectId || context.projectId,
					},
					buildAxiosConfig(context),
				);
				return JSON.stringify(response.data);
			} catch (error: any) {
				throw new Error(`suggest_user_stories failed (${endpoint}): ${formatToolError(error)}`);
			}
		},
	};

	const suggestTasksTool: Tool = {
		name: 'suggest_tasks',
		description: 'Suggests tasks for a specific user story. Returns a list of task titles and descriptions.',
		invoke: async (input: {
			userStoryText: string;
			projectBrief?: string;
			epicName?: string;
			projectId?: string;
		}) => {
			const endpoint = `${baseURL}/tenant/${tenantId}/ai-agent/planner-suggest-tasks-for-user-story-of-epic`;
			try {
				const response = await axios.post(
					endpoint,
					{
						userStoryText: input.userStoryText,
						projectBrief: input.projectBrief,
						epicName: input.epicName,
						projectId: input.projectId || context.projectId,
					},
					buildAxiosConfig(context),
				);
				return JSON.stringify(response.data);
			} catch (error: any) {
				throw new Error(`suggest_tasks failed (${endpoint}): ${formatToolError(error)}`);
			}
		},
	};

	const suggestTestCasesTool: Tool = {
		name: 'suggest_test_cases',
		description: 'Suggests test cases for a task. Returns a list of test cases with steps and expected results.',
		invoke: async (input: { taskTitle: string; taskDescription?: string; projectId?: string }) => {
			const endpoint = `${baseURL}/tenant/${tenantId}/ai-agent/suggest-test-cases-for-task`;
			try {
				const response = await axios.post(
					endpoint,
					{
						taskTitle: input.taskTitle,
						taskDescription: input.taskDescription,
						projectId: input.projectId || context.projectId,
					},
					buildAxiosConfig(context),
				);
				return JSON.stringify(response.data);
			} catch (error: any) {
				throw new Error(`suggest_test_cases failed (${endpoint}): ${formatToolError(error)}`);
			}
		},
	};

	const suggestEstimationsTool: Tool = {
		name: 'suggest_estimations',
		description: 'Suggests time estimations for a task or project. Returns low, ideal, and high estimates by role.',
		invoke: async (input: { projectId: string; taskId?: string }) => {
			try {
				const effectiveProjectId = input.projectId || context.projectId;
				if (!effectiveProjectId) {
					throw new Error('projectId is required for suggest_estimations');
				}

				const endpoint = input.taskId
					? `${baseURL}/tenant/${tenantId}/ai-agent/suggest-estimations-for-task/${effectiveProjectId}/${input.taskId}`
					: `${baseURL}/tenant/${tenantId}/ai-agent/suggest-estimations-for-project/${effectiveProjectId}`;

				const response = await axios.get(endpoint, buildAxiosConfig(context));
				return JSON.stringify(response.data);
			} catch (error: any) {
				throw new Error(`suggest_estimations failed: ${formatToolError(error)}`);
			}
		},
	};

	const suggestTodosTool: Tool = {
		name: 'suggest_todos',
		description: 'Suggests todo items (subtasks) for a task. Returns a list of todo items.',
		invoke: async (input: {
			taskTitle: string;
			taskDescription?: string;
			projectBrief?: string;
			userStoryTitle?: string;
			projectId?: string;
		}) => {
			const endpoint = `${baseURL}/tenant/${tenantId}/ai-agent/planner-suggest-todos-for-task`;
			try {
				const response = await axios.post(
					endpoint,
					{
						taskTitle: input.taskTitle,
						taskDescription: input.taskDescription,
						projectBrief: input.projectBrief,
						userStoryTitle: input.userStoryTitle,
						projectId: input.projectId || context.projectId,
					},
					buildAxiosConfig(context),
				);
				return JSON.stringify(response.data);
			} catch (error: any) {
				throw new Error(`suggest_todos failed (${endpoint}): ${formatToolError(error)}`);
			}
		},
	};

	const suggestProjectDescriptionTool: Tool = {
		name: 'suggest_project_description',
		description: 'Refines and improves a project description to be more implementation-focused.',
		invoke: async (input: { description: string }) => {
			const endpoint = `${baseURL}/tenant/${tenantId}/ai-agent/suggest-project-description`;
			try {
				const response = await axios.post(
					endpoint,
					{ description: input.description },
					buildAxiosConfig(context),
				);
				return JSON.stringify(response.data);
			} catch (error: any) {
				throw new Error(
					`suggest_project_description failed (${endpoint}): ${formatToolError(error)}`,
				);
			}
		},
	};

	return [
		suggestEpicsTool,
		suggestUserStoriesTool,
		suggestTasksTool,
		suggestTestCasesTool,
		suggestEstimationsTool,
		suggestTodosTool,
		suggestProjectDescriptionTool,
	];
}
