import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AiAgentService, { AiChatSession } from 'src/modules/aiAgent/aiAgentService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const ChatPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [session, setSession] = useState<AiChatSession | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [session, loading]);

  // Build displayed messages from session history and current data
  const getDisplayedMessages = (): ChatMessage[] => {
    if (!session) return [];

    const messages: ChatMessage[] = [];

    // Add initial greeting if no history
    if (!session.history?.length && !session.data?.request?.userInput) {
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
        if (entry.request?.userInput) {
          messages.push({
            role: 'user',
            content: entry.request.userInput,
          });
        }
        if (entry.response?.message) {
          messages.push({
            role: 'assistant',
            content: entry.response.message,
          });
        }
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
      const { success, generation } = await AiAgentService.chat(
        projectId,
        trimmed,
        session?._id || session?.id,
      );

      if (success && generation) {
        setSession(generation);
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