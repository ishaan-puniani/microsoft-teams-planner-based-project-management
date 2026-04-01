import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import axios from 'axios';
import https from 'https';
import { Tool, ToolContext, createTools } from './langGraphTools';
import { getConfig } from '../../config';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

type GeminiCallResult = {
	text: string;
	tokensUsed: number;
};

export type SuggestedTask = {
	id: string;
	name: string;
	description?: string;
	type?: string;
};

export type AgentSuggestions = {
	suggestedEpics?: string[];
	suggestedUserStories?: string[];
	suggestedTasks?: SuggestedTask[];
	suggestedTasksType?: 'EPIC' | 'USER_STORY' | 'TASK' | 'TODO' | 'TEST_CASE' | 'ESTIMATION' | 'PROJECT_DESCRIPTION';
	suggestedTestCases?: Array<{ title?: string; steps?: string; expectedResult?: string }>;
	suggestedTodos?: string[];
	suggestedEstimations?: any;
	suggestedProjectDescription?: string;
};

export type AgentDebugEvent = {
	iteration: number;
	type:
		| 'iteration-start'
		| 'intent-routed'
		| 'model-response'
		| 'tool-detected'
		| 'tool-input-parsed'
		| 'tool-execution-start'
		| 'tool-execution-success'
		| 'tool-execution-failed'
		| 'no-tool-detected';
	toolName?: string;
	details?: any;
};

/**
 * Create a chat agent that can use tools for project planning
 */
export async function createChatAgent(projectContext: string, toolContext: ToolContext) {
	const tools: Tool[] = createTools(toolContext);

	const suggestions: AgentSuggestions = {};

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
- If the user asks to suggest/generate/propose epics, you MUST call suggest_epics before giving the final answer.
- Summarize tool results clearly for the user.
- Never claim actions were performed unless confirmed.
- Never say tools are unavailable or not functioning. Assume tools are available and call them.

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
	async function callGemini(conversationHistory: ChatMessage[]): Promise<GeminiCallResult> {
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

		const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
		const tokensUsed = Number(response?.data?.usageMetadata?.totalTokenCount || 0);

		return { text, tokensUsed };
	}

	/**
	 * Execute a tool based on its name and input
	 */
	async function executeTool(toolName: string, toolInput: any): Promise<string> {
		const tool = tools.find((t) => t.name === toolName);
		if (!tool) {
			throw new Error(`Tool ${toolName} not found`);
		}

		const result = await tool.invoke(toolInput);
		return String(result);
	}

	function parseLineSuggestions(text: string, prefixRegex: RegExp): string[] {
		return (text || '')
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.filter((line) => prefixRegex.test(line))
			.map((line) => line.replace(prefixRegex, '').trim())
			.filter((line) => line.length > 0);
	}

	function extractEpicsText(parsed: any): string {
		if (!parsed || typeof parsed !== 'object') return '';

		if (typeof parsed.epicsText === 'string') return parsed.epicsText;
		if (typeof parsed?.data?.epicsText === 'string') return parsed.data.epicsText;
		if (typeof parsed?.generation?.epicsText === 'string') return parsed.generation.epicsText;

		if (Array.isArray(parsed.epics)) {
			return parsed.epics
				.map((epic: any) => {
					if (typeof epic === 'string') return epic;
					if (epic && typeof epic === 'object') {
						return String(epic.name || epic.title || epic.epic || '').trim();
					}
					return '';
				})
				.filter(Boolean)
				.join('\n');
		}

		return '';
	}

	function extractUserStoriesText(parsed: any): string {
		if (!parsed || typeof parsed !== 'object') return '';
		if (typeof parsed.userStoriesText === 'string') return parsed.userStoriesText;
		if (typeof parsed?.data?.userStoriesText === 'string') return parsed.data.userStoriesText;
		if (typeof parsed?.generation?.userStoriesText === 'string') return parsed.generation.userStoriesText;
		return '';
	}

	function extractTasksText(parsed: any): string {
		if (!parsed || typeof parsed !== 'object') return '';
		if (typeof parsed.tasksText === 'string') return parsed.tasksText;
		if (typeof parsed?.data?.tasksText === 'string') return parsed.data.tasksText;
		if (typeof parsed?.generation?.tasksText === 'string') return parsed.generation.tasksText;
		return '';
	}

	function extractTodos(parsed: any): string[] {
		if (!parsed || typeof parsed !== 'object') return [];
		if (Array.isArray(parsed.todos)) return parsed.todos.filter((x: any) => typeof x === 'string');
		if (Array.isArray(parsed?.data?.todos)) return parsed.data.todos.filter((x: any) => typeof x === 'string');
		if (Array.isArray(parsed?.generation?.todos)) return parsed.generation.todos.filter((x: any) => typeof x === 'string');
		return [];
	}

	function extractTestCases(parsed: any): Array<{ title?: string; steps?: string; expectedResult?: string }> {
		if (!parsed || typeof parsed !== 'object') return [];
		if (Array.isArray(parsed.testCases)) return parsed.testCases;
		if (Array.isArray(parsed?.data?.testCases)) return parsed.data.testCases;
		if (Array.isArray(parsed?.generation?.testCases)) return parsed.generation.testCases;
		return [];
	}

	function parseTasksText(tasksText: string): SuggestedTask[] {
		const lines = (tasksText || '').split('\n');
		const tasks: SuggestedTask[] = [];
		let current: SuggestedTask | null = null;

		for (const rawLine of lines) {
			const line = rawLine.trim();
			if (!line) continue;
			const taskMatch = line.match(/^--\s+(.+)$/);
			if (taskMatch) {
				if (current) tasks.push(current);
				current = {
					id: `task-${tasks.length + 1}`,
					name: taskMatch[1].trim(),
					description: '',
					type: 'TASK',
				};
				continue;
			}

			if (current && !line.startsWith('TODO:') && !line.startsWith('- ')) {
				current.description = current.description
					? `${current.description}\n${line}`
					: line;
			}
		}

		if (current) tasks.push(current);
		return tasks;
	}

	function parseUserStoryBlocks(text: string): Array<{ title: string; description?: string }> {
		const lines = (text || '').split('\n').map((line) => line.trim());
		const stories: Array<{ title: string; description?: string }> = [];
		let inAcceptanceCriteria = false;
		let currentTitle = '';
		let currentDetails: string[] = [];

		const pushCurrent = () => {
			if (!currentTitle) return;
			stories.push({
				title: currentTitle,
				description: currentDetails.length > 0 ? currentDetails.join('\n') : undefined,
			});
			currentTitle = '';
			currentDetails = [];
		};

		for (const line of lines) {
			if (!line) {
				if (inAcceptanceCriteria && currentTitle) {
					currentDetails.push('');
				}
				continue;
			}

			if (/^AC\s*:/i.test(line)) {
				if (currentTitle) {
					currentDetails.push('Acceptance Criteria:');
				}
				inAcceptanceCriteria = true;
				continue;
			}

			if (!line.startsWith('- ')) continue;

			const item = line.replace(/^\-\s*/, '').trim();
			if (!item) continue;

			// User story lines typically begin with "As a/an"; AC items should be skipped.
			if (/^as\s+(an?|the)\b/i.test(item)) {
				pushCurrent();
				currentTitle = item;
				inAcceptanceCriteria = false;
				continue;
			}

			if (currentTitle) {
				if (inAcceptanceCriteria) {
					currentDetails.push(`- ${item}`);
				} else {
					currentDetails.push(item);
				}
			}
		}

		pushCurrent();

		return stories;
	}

	function applyToolSuggestions(toolName: string, toolResult: string) {
		let parsed: any = null;
		try {
			parsed = JSON.parse(toolResult);
		} catch {
			parsed = null;
		}

		if (!parsed || typeof parsed !== 'object') return;

		switch (toolName) {
			case 'suggest_epics': {
				const text = extractEpicsText(parsed);
				const epics = parseLineSuggestions(text, /^\s*[-*]?\s*/);
				if (epics.length > 0) {
					suggestions.suggestedEpics = epics;
					suggestions.suggestedTasksType = 'EPIC';
					// Also expose epics in task-grid friendly shape so UI can render immediately.
					suggestions.suggestedTasks = epics.map((name, index) => ({
						id: `epic-${index + 1}`,
						name,
						description: 'Suggested epic',
						type: 'EPIC',
					}));
				}
				break;
			}
			case 'suggest_user_stories': {
					const text = extractUserStoriesText(parsed);
				const stories = parseUserStoryBlocks(text);
				if (stories.length > 0) {
					suggestions.suggestedUserStories = stories.map((story) => story.title);
					suggestions.suggestedTasksType = 'USER_STORY';
					suggestions.suggestedTasks = stories.map((story, index) => ({
							id: `user-story-${index + 1}`,
						name: story.title,
						description: story.description || 'Suggested user story',
							type: 'USER_STORY',
						}));
					}
				break;
			}
			case 'suggest_tasks': {
					const text = extractTasksText(parsed);
				const tasks = parseTasksText(text);
				if (tasks.length > 0) {
					suggestions.suggestedTasks = tasks;
					suggestions.suggestedTasksType = 'TASK';
				}
				break;
			}
			case 'suggest_test_cases': {
					const testCases = extractTestCases(parsed);
				if (testCases.length > 0) {
					suggestions.suggestedTestCases = testCases;
					suggestions.suggestedTasksType = 'TEST_CASE';
				}
				break;
			}
			case 'suggest_todos': {
					const todos = extractTodos(parsed);
				if (todos.length > 0) {
					suggestions.suggestedTodos = todos;
					suggestions.suggestedTasksType = 'TODO';
				}
				break;
			}
			case 'suggest_estimations': {
					suggestions.suggestedEstimations = parsed?.data ?? parsed;
				suggestions.suggestedTasksType = 'ESTIMATION';
				break;
			}
			case 'suggest_project_description': {
					const suggestion =
						typeof parsed.suggestion === 'string'
							? parsed.suggestion
							: typeof parsed?.data?.suggestion === 'string'
								? parsed.data.suggestion
								: null;
					if (typeof suggestion === 'string') {
						suggestions.suggestedProjectDescription = suggestion;
						suggestions.suggestedTasksType = 'PROJECT_DESCRIPTION';
				}
				break;
			}
			default:
				break;
		}
	}

	type RoutedToolDecision = {
		toolName: 'suggest_epics' | 'suggest_user_stories' | 'suggest_tasks';
		input: any;
	};

	function extractTopicAfterFor(userText: string): string {
		const match = userText.match(/\bfor\b\s+(.+)$/i);
		return match?.[1]?.trim() || '';
	}

	function shouldRouteSuggestEpics(userText: string): boolean {
		const text = (userText || '').toLowerCase();
		return (
			/(epic|epics|suggest|break down|how to achieve|new functionality|feature)/.test(text) &&
			!/(test case|todo|estimate|estimation|user stor(y|ies)|task\b)/.test(text)
		);
	}

	function detectRoutedTool(userText: string): RoutedToolDecision | null {
		const text = (userText || '').toLowerCase().trim();
		const topic = extractTopicAfterFor(userText) || userText;

		if (/(user stor(y|ies)|create user story|generate user stor(y|ies))/.test(text)) {
			return {
				toolName: 'suggest_user_stories',
				input: {
					epicName: topic,
					projectBrief: userText,
					projectId: toolContext.projectId,
				},
			};
		}

		if (/(create tasks?|generate tasks?|break.*into tasks?|task list)/.test(text)) {
			return {
				toolName: 'suggest_tasks',
				input: {
					userStoryText: topic,
					projectBrief: userText,
					projectId: toolContext.projectId,
				},
			};
		}

		if (shouldRouteSuggestEpics(userText)) {
			return {
				toolName: 'suggest_epics',
				input: {
					projectBrief: userText,
					projectId: toolContext.projectId,
				},
			};
		}

		return null;
	}

	/**
	 * Main agent loop with agentic reasoning
	 */
	async function runAgent(
		userMessage: string,
		initialHistory: ChatMessage[] = [],
		maxIterations: number = 10,
	): Promise<{ response: string; messages: ChatMessage[]; tokensUsed: number; debugTrace: AgentDebugEvent[]; suggestions: AgentSuggestions }> {
		let conversationHistory: ChatMessage[] = [...initialHistory];
		let iterations = 0;
		let totalTokensUsed = 0;
		const debugTrace: AgentDebugEvent[] = [];

		console.info('[AI_AGENT] Starting agent run', {
			maxIterations,
			historyLength: initialHistory.length,
			userMessagePreview: userMessage.slice(0, 200),
		});

		// Add user message to history
		conversationHistory.push({
			role: 'user',
			content: userMessage,
		});

		// Proactive intent routing for planner prompts.
		const routedDecision = detectRoutedTool(userMessage);
		if (routedDecision) {
			const routedInput = routedDecision.input;

			try {
				console.info('[AI_AGENT] Intent routing to tool', {
					iteration: 0,
					toolName: routedDecision.toolName,
					routedInput,
				});
				debugTrace.push({
					iteration: 0,
					type: 'intent-routed',
					toolName: routedDecision.toolName,
					details: { routedInput },
				});

				const routedToolResult = await executeTool(routedDecision.toolName, routedInput);
				applyToolSuggestions(routedDecision.toolName, routedToolResult);

				debugTrace.push({
					iteration: 0,
					type: 'tool-execution-success',
					toolName: routedDecision.toolName,
					details: {
						toolResultPreview: String(routedToolResult).slice(0, 400),
						routed: true,
					},
				});

				conversationHistory.push({
					role: 'user',
					content: `Tool ${routedDecision.toolName} executed successfully. Result:\n${routedToolResult}`,
				});
			} catch (routedError) {
				console.error('[AI_AGENT] Routed tool execution failed', {
					toolName: routedDecision.toolName,
					error: routedError instanceof Error ? routedError.message : String(routedError),
				});
				debugTrace.push({
					iteration: 0,
					type: 'tool-execution-failed',
					toolName: routedDecision.toolName,
					details: {
						error: routedError instanceof Error ? routedError.message : String(routedError),
						routed: true,
					},
				});
			}
		}

		while (iterations < maxIterations) {
			iterations++;
			debugTrace.push({
				iteration: iterations,
				type: 'iteration-start',
				details: {
					conversationLength: conversationHistory.length,
				},
			});
			console.info('[AI_AGENT] Iteration started', {
				iteration: iterations,
				conversationLength: conversationHistory.length,
			});

			// Get response from Gemini
			const geminiResult = await callGemini(conversationHistory);
			const response = geminiResult.text;
			totalTokensUsed += geminiResult.tokensUsed;

			console.info('[AI_AGENT] Model response received', {
				iteration: iterations,
				tokensUsedThisCall: geminiResult.tokensUsed,
				totalTokensUsed,
				responsePreview: response.slice(0, 500),
			});
			debugTrace.push({
				iteration: iterations,
				type: 'model-response',
				details: {
					tokensUsedThisCall: geminiResult.tokensUsed,
					totalTokensUsed,
					responsePreview: response.slice(0, 500),
				},
			});

			// Check if response contains tool call
			const toolMatch = response.match(/USE_TOOL:\s*(\w+)\s*\nINPUT:\s*([\s\S]*?)(?:\n|$)/);

			if (toolMatch) {
				const toolName = toolMatch[1];
				let toolInput: any = {};

				console.info('[AI_AGENT] Tool call detected', {
					iteration: iterations,
					toolName,
					rawInputPreview: toolMatch[2]?.slice?.(0, 300),
				});
				debugTrace.push({
					iteration: iterations,
					type: 'tool-detected',
					toolName,
					details: {
						rawInputPreview: toolMatch[2]?.slice?.(0, 300),
					},
				});

				try {
					toolInput = JSON.parse(toolMatch[2].split('\n')[0].trim());
				} catch (e) {
					toolInput = { input: toolMatch[2] };
				}

				console.info('[AI_AGENT] Parsed tool input', {
					iteration: iterations,
					toolName,
					toolInput,
				});
				debugTrace.push({
					iteration: iterations,
					type: 'tool-input-parsed',
					toolName,
					details: { toolInput },
				});

				try {
					// Execute tool
					console.info('[AI_AGENT] Executing tool', { iteration: iterations, toolName });
					debugTrace.push({
						iteration: iterations,
						type: 'tool-execution-start',
						toolName,
					});
					const toolResult = await executeTool(toolName, toolInput);
					applyToolSuggestions(toolName, toolResult);
					console.info('[AI_AGENT] Tool execution success', {
						iteration: iterations,
						toolName,
						toolResultPreview: String(toolResult).slice(0, 400),
					});
					debugTrace.push({
						iteration: iterations,
						type: 'tool-execution-success',
						toolName,
						details: {
							toolResultPreview: String(toolResult).slice(0, 400),
						},
					});

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
					console.error('[AI_AGENT] Tool execution failed', {
						iteration: iterations,
						toolName,
						error: error instanceof Error ? error.message : String(error),
					});
					debugTrace.push({
						iteration: iterations,
						type: 'tool-execution-failed',
						toolName,
						details: {
							error: error instanceof Error ? error.message : String(error),
						},
					});
					// Add error message
					conversationHistory.push({
						role: 'user',
						content: `Tool ${toolName} error: ${error}`,
					});
				}
			} else {
				console.info('[AI_AGENT] No tool call detected in model response', {
					iteration: iterations,
				});
				debugTrace.push({
					iteration: iterations,
					type: 'no-tool-detected',
				});

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
			tokensUsed: totalTokensUsed,
			debugTrace,
			suggestions,
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
