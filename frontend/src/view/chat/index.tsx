import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AiAgentService, { AiChatSession } from 'src/modules/aiAgent/aiAgentService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import SubtaskExcelView from 'src/view/task/SubtaskExcelView';

type TaskExcelItem = {
  id: string;
  name: string;
  description?: string;
  type?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  suggestedTasks?: TaskExcelItem[];
};

const DEFAULT_ACTIONS_MESSAGE =
  'Hello! I can help you manage this project.\n\nYou can ask me to:\n1. Suggest epics from a project brief\n2. Break an epic into user stories\n3. Generate tasks from a user story\n4. Suggest todos/subtasks for a task\n5. Suggest test cases for a task\n6. Estimate effort for a task or project\n7. Refine project descriptions\n\nTry: "Suggest epics for this project" or "Break Epic X into user stories".';

function createDefaultSession(): AiChatSession {
  return {
    data: {
      request: { userInput: '' },
      response: { success: true, message: DEFAULT_ACTIONS_MESSAGE, error: null, suggestedTasks: [] },
      tokensUsed: 0,
    },
    history: [],
  };
}

function createHistoryMessage(entry: {
  request?: { userInput?: string };
  response?: { message?: string; suggestedTasks?: TaskExcelItem[] };
}): ChatMessage[] {
  const out: ChatMessage[] = [];
  if (entry.request?.userInput) {
    out.push({ role: 'user', content: entry.request.userInput });
  }
  if (entry.response?.message) {
    out.push({
      role: 'assistant',
      content: entry.response.message,
      suggestedTasks: entry.response.suggestedTasks || [],
    });
  }
  return out;
}

const ChatPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [session, setSession] = useState<AiChatSession | null>(null);
  const [latestSuggestedTasks, setLatestSuggestedTasks] = useState<TaskExcelItem[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [session, loading]);

  useEffect(() => {
    if (!projectId) {
      setSession(createDefaultSession());
      return;
    }

    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { success, generation } = await AiAgentService.chatHistory(projectId);
        if (!active) return;

        if (success && generation) {
          setSession(generation);
        } else {
          setSession(createDefaultSession());
        }
      } catch (historyError: any) {
        if (!active) return;
        setSession(createDefaultSession());
        const message =
          historyError?.response?.data?.error ||
          historyError?.response?.data?.message ||
          historyError?.message;
        if (message) {
          setError(`Could not load chat history: ${String(message)}`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [projectId]);

  // Build displayed messages from session history and current data
  const getDisplayedMessages = (): ChatMessage[] => {
    if (!session) return [];

    const messages: ChatMessage[] = [];

    // Add initial greeting if no history and no existing response
    if (!session.history?.length && !session.data?.request?.userInput && !session.data?.response?.message) {
      messages.push({
        role: 'assistant',
        content:
          'Hello! I can help with project planning, task breakdown, estimations, risks, and acceptance criteria. Ask me anything about this project.',
      });
      return messages;
    }

    // Add history
    if (session.history && Array.isArray(session.history)) {
      for (const entry of session.history) {
        messages.push(...createHistoryMessage(entry as any));
      }
    }

    // Add current data
    if (session.data?.request?.userInput) {
      messages.push({
        role: 'user',
        content: session.data.request.userInput,
      });
    }
    if (session.data?.response?.message) {
      messages.push({
        role: 'assistant',
        content: session.data.response.message,
        suggestedTasks:
          session.data.response.suggestedTasks || latestSuggestedTasks,
      });
    }

    return messages;
  };

  const sendMessage = async () => {
    if (loading) return;
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!projectId) {
      setError('Missing project id in route.');
      return;
    }

    setDraft('');
    setLoading(true);
    setError(null);

    try {
      const response = await AiAgentService.chat(
        projectId,
        trimmed,
        session?._id || session?.id,
      );

      if (response.success && response.generation) {
        setSession(response.generation);
        setLatestSuggestedTasks(
          response.generation.data?.response?.suggestedTasks ||
            response.suggestedTasks ||
            [],
        );
      } else {
        setError('Failed to get AI response.');
      }
    } catch (chatError: any) {
      const message =
        chatError?.response?.data || chatError?.message || 'Failed to get AI response.';
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  const onEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messages = getDisplayedMessages();

  return (
    <ContentWrapper>
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>AI Project Chat</strong>
          <span className="text-muted small">
            Project: {projectId}
            {session?._id && <span className="ms-2">| Session: {session._id.toString().slice(0, 8)}</span>}
          </span>
        </div>

        <div
          className="card-body"
          style={{ maxHeight: '65vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`d-flex mb-2 ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-2 rounded ${message.role === 'user' ? 'bg-primary text-white' : 'bg-white border'}`}
                style={{ maxWidth: '80%', whiteSpace: 'pre-wrap' }}
              >
                {message.content}
                {message.role === 'assistant' && (message.suggestedTasks?.length || 0) > 0 && (
                  <SubtaskExcelView
                    preSuggestedTasks={message.suggestedTasks || []}
                    taskId={undefined}
                    projectId={projectId || null}
                    type="TASK"
                  />
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="d-flex justify-content-start mb-2">
              <div className="p-2 rounded bg-white border text-muted">Thinking...</div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="card-footer">
          {error && <div className="alert alert-danger py-2 mb-2">{error}</div>}

          <div className="d-flex gap-2">
            <textarea
              className="form-control"
              rows={2}
              placeholder="Type your message. Press Enter to send, Shift+Enter for a new line."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onEditorKeyDown}
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={loading || !draft.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
};

export default ChatPage;