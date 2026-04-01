import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import axios from 'axios';
import https from 'https';
import { allTools } from './langGraphTools';
import { getConfig } from '../../config';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

/**
 * Create a chat agent that can use tools for project planning
 */
export async function createChatAgent(projectContext: string) {
	const apiKey = getConfig().GEMINI_API_KEY || getConfig().GOOGLE_GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY must be set in environment');
	}

	const model = getConfig().GEMINI_MODEL || 'gemini-2.0-flash';

	const systemPrompt = `You are an AI project management copilot for a Microsoft Teams Planner based product.

Project Context:
${projectContext}

You can help with:
1. Creating and planning projects
2. Suggesting epics based on project descriptions
3. Breaking down epics into user stories
4. Creating tasks from user stories
5. Suggesting test cases for tasks
6. Estimating effort (story points, hours) by role
7. Creating todo lists for tasks
8. Refining project descriptions

Behavior rules:
- Be concise, practical, and action-oriented.
- Break down complex requests into steps using available tools.
- Ask for missing details if needed.
- Use tools proactively to provide structured guidance.
- Summarize tool results clearly for the user.
- Never claim actions were performed unless confirmed.

When you decide to use a tool, format it as:
USE_TOOL: <tool_name>
INPUT: <json_input>

Available tools:
- suggest_epics: Generate epics from a project brief
- suggest_user_stories: Create user stories from an epic
- suggest_tasks: Break down user stories into tasks
- suggest_test_cases: Generate test cases for a task
- suggest_estimations: Estimate time/effort for tasks
- suggest_todos: Create subtasks/todos for a task
- suggest_project_description: Refine a project description`;

	/**
	 * Call Gemini to get model response
	 */
	async function callGemini(conversationHistory: ChatMessage[]): Promise<string> {
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

		// Format messages for Gemini API
		const contents = conversationHistory.map((msg) => ({
			role: msg.role === 'assistant' ? 'model' : 'user',
			parts: [{ text: msg.content }],
		}));

		// Add system prompt as first message
		const allContents = [{ role: 'user' as const, parts: [{ text: systemPrompt }] }, ...contents];

		const response = await axios.post(
			url,
			{
				contents: allContents,
				generationConfig: {
					temperature: 0.35,
					maxOutputTokens: 2048,
				},
			},
			{
				headers: { 'Content-Type': 'application/json' },
				httpsAgent: geminiHttpsAgent,
				timeout: 60000,
			},
		);

		return response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
	}

	/**
	 * Execute a tool based on its name and input
	 */
	async function executeTool(toolName: string, toolInput: any): Promise<string> {
		const tool = allTools.find((t) => t.name === toolName);
		if (!tool) {
			throw new Error(`Tool ${toolName} not found`);
		}

		const result = await tool.invoke(toolInput);
		return String(result);
	}

	/**
	 * Main agent loop with agentic reasoning
	 */
	async function runAgent(
		userMessage: string,
		initialHistory: ChatMessage[] = [],
		maxIterations: number = 10,
	): Promise<{ response: string; messages: ChatMessage[] }> {
		let conversationHistory: ChatMessage[] = [...initialHistory];
		let iterations = 0;

		// Add user message to history
		conversationHistory.push({
			role: 'user',
			content: userMessage,
		});

		while (iterations < maxIterations) {
			iterations++;

			// Get response from Gemini
			const response = await callGemini(conversationHistory);

			// Check if response contains tool call
			const toolMatch = response.match(/USE_TOOL:\s*(\w+)\s*\nINPUT:\s*([\s\S]*?)(?:\n|$)/);

			if (toolMatch) {
				const toolName = toolMatch[1];
				let toolInput: any = {};

				try {
					toolInput = JSON.parse(toolMatch[2].split('\n')[0].trim());
				} catch (e) {
					toolInput = { input: toolMatch[2] };
				}

				try {
					// Execute tool
					const toolResult = await executeTool(toolName, toolInput);

					// Add assistant response and tool result to history
					conversationHistory.push({
						role: 'assistant',
						content: response,
					});

					conversationHistory.push({
						role: 'user',
						content: `Tool ${toolName} executed successfully. Result:\n${toolResult}`,
					});
				} catch (error) {
					// Add error message
					conversationHistory.push({
						role: 'user',
						content: `Tool ${toolName} error: ${error}`,
					});
				}
			} else {
				// No tool call, end the agent loop
				conversationHistory.push({
					role: 'assistant',
					content: response,
				});
				break;
			}
		}

		// Extract final response
		const finalMessage = conversationHistory[conversationHistory.length - 1];
		const finalResponse = finalMessage.role === 'assistant' ? finalMessage.content : 'No response generated';

		return {
			response: finalResponse,
			messages: conversationHistory,
		};
	}

	return {
		invoke: runAgent,
	};
}

/**
 * Convert chat history to message format
 */
export function convertHistoryToMessages(
	history: Array<{
		request: { userInput: string };
		response: { success: boolean; message: string };
	}>,
): ChatMessage[] {
	const messages: ChatMessage[] = [];

	for (const entry of history) {
		messages.push({
			role: 'user',
			content: entry.request.userInput,
		});
		messages.push({
			role: 'assistant',
			content: entry.response.message,
		});
	}

	return messages;
}
