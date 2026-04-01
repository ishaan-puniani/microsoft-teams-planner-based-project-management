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

/**
 * Suggest epics for a project based on a brief description
 */
const suggestEpicsTool: Tool = {
	name: 'suggest_epics',
	description: 'Suggests epics for a project based on a brief description. Returns a list of epic names and descriptions.',
	invoke: async (input: { projectBrief: string; projectId?: string }) => {
		try {
			const config = getConfig();
			const baseURL = config.API_URL || 'http://localhost:3000';
			const tenantId = config.CURRENT_TENANT_ID || 'default';

			const response = await axios.post(`${baseURL}/tenant/${tenantId}/ai-agent/planner-suggest-epics`, {
				projectBrief: input.projectBrief,
				projectId: input.projectId,
			});
			return JSON.stringify(response.data);
		} catch (error: any) {
			return JSON.stringify({ error: error.message });
		}
	},
};

/**
 * Suggest user stories for an epic
 */
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
		try {
			const config = getConfig();
			const baseURL = config.API_URL || 'http://localhost:3000';
			const tenantId = config.CURRENT_TENANT_ID || 'default';

			const response = await axios.post(
				`${baseURL}/tenant/${tenantId}/ai-agent/planner-suggest-user-story-for-epic`,
				{
					epicName: input.epicName,
					projectBrief: input.projectBrief,
					epicDescription: input.epicDescription,
					projectId: input.projectId,
				},
			);
			return JSON.stringify(response.data);
		} catch (error: any) {
			return JSON.stringify({ error: error.message });
		}
	},
};

/**
 * Suggest tasks for a user story
 */
const suggestTasksTool: Tool = {
	name: 'suggest_tasks',
	description: 'Suggests tasks for a specific user story. Returns a list of task titles and descriptions.',
	invoke: async (input: {
		userStoryText: string;
		projectBrief?: string;
		epicName?: string;
		projectId?: string;
	}) => {
		try {
			const config = getConfig();
			const baseURL = config.API_URL || 'http://localhost:3000';
			const tenantId = config.CURRENT_TENANT_ID || 'default';

			const response = await axios.post(
				`${baseURL}/tenant/${tenantId}/ai-agent/planner-suggest-tasks-for-user-story-of-epic`,
				{
					userStoryText: input.userStoryText,
					projectBrief: input.projectBrief,
					epicName: input.epicName,
					projectId: input.projectId,
				},
			);
			return JSON.stringify(response.data);
		} catch (error: any) {
			return JSON.stringify({ error: error.message });
		}
	},
};

/**
 * Suggest test cases for a task
 */
const suggestTestCasesTool: Tool = {
	name: 'suggest_test_cases',
	description: 'Suggests test cases for a task. Returns a list of test cases with steps and expected results.',
	invoke: async (input: { taskTitle: string; taskDescription?: string; projectId?: string }) => {
		try {
			const config = getConfig();
			const baseURL = config.API_URL || 'http://localhost:3000';
			const tenantId = config.CURRENT_TENANT_ID || 'default';

			const response = await axios.post(
				`${baseURL}/tenant/${tenantId}/ai-agent/suggest-test-cases-for-task`,
				{
					taskTitle: input.taskTitle,
					taskDescription: input.taskDescription,
				},
			);
			return JSON.stringify(response.data);
		} catch (error: any) {
			return JSON.stringify({ error: error.message });
		}
	},
};

/**
 * Suggest time/effort estimations
 */
const suggestEstimationsTool: Tool = {
	name: 'suggest_estimations',
	description: 'Suggests time estimations for a task or project. Returns low, ideal, and high estimates by role.',
	invoke: async (input: { projectId: string; taskId?: string }) => {
		try {
			const config = getConfig();
			const baseURL = config.API_URL || 'http://localhost:3000';
			const tenantId = config.CURRENT_TENANT_ID || 'default';

			const endpoint = input.taskId
				? `${baseURL}/tenant/${tenantId}/ai-agent/suggest-estimations-for-task/${input.projectId}/${input.taskId}`
				: `${baseURL}/tenant/${tenantId}/ai-agent/suggest-estimations-for-project/${input.projectId}`;

			const response = await axios.get(endpoint);
			return JSON.stringify(response.data);
		} catch (error: any) {
			return JSON.stringify({ error: error.message });
		}
	},
};

/**
 * Suggest todos for a task
 */
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
		try {
			const config = getConfig();
			const baseURL = config.API_URL || 'http://localhost:3000';
			const tenantId = config.CURRENT_TENANT_ID || 'default';

			const response = await axios.post(
				`${baseURL}/tenant/${tenantId}/ai-agent/planner-suggest-todos-for-task`,
				{
					taskTitle: input.taskTitle,
					taskDescription: input.taskDescription,
					projectBrief: input.projectBrief,
					userStoryTitle: input.userStoryTitle,
					projectId: input.projectId,
				},
			);
			return JSON.stringify(response.data);
		} catch (error: any) {
			return JSON.stringify({ error: error.message });
		}
	},
};

/**
 * Suggest/refine project description
 */
const suggestProjectDescriptionTool: Tool = {
	name: 'suggest_project_description',
	description: 'Refines and improves a project description to be more implementation-focused.',
	invoke: async (input: { description: string }) => {
		try {
			const config = getConfig();
			const baseURL = config.API_URL || 'http://localhost:3000';
			const tenantId = config.CURRENT_TENANT_ID || 'default';

			const response = await axios.post(
				`${baseURL}/tenant/${tenantId}/ai-agent/suggest-project-description`,
				{ description: input.description },
			);
			return JSON.stringify(response.data);
		} catch (error: any) {
			return JSON.stringify({ error: error.message });
		}
	},
};

// Export all tools
export const allTools: Tool[] = [
	suggestEpicsTool,
	suggestUserStoriesTool,
	suggestTasksTool,
	suggestTestCasesTool,
	suggestEstimationsTool,
	suggestTodosTool,
	suggestProjectDescriptionTool,
];
